import { test, expect, type Page } from "@playwright/test";

// We run in serial because each test depends on the state of the previous one
test.describe.configure({ mode: "serial" });

test.describe("DCIM Full Lifecycle: Onboarding to Deletion", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  // --- DAY 1: ONBOARDING & PROVISIONING ---

  test("Step 1: Account Creation & Signup", async () => {
    await page.goto("/signup");
    await page.getByPlaceholder(/username/i).fill("admin_user");
    await page.getByPlaceholder(/password/i).fill("SecurePass123!");
    await page.getByPlaceholder(/company name/i).fill("Cloud-Net Solutions");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page).toHaveURL("/login");
  });

  test("Step 2: Login and Resource Purchase", async () => {
    // Login
    await page.goto("/login");
    await page.getByPlaceholder(/username/i).fill("admin_user");
    await page.getByPlaceholder(/password/i).fill("SecurePass123!");
    await page.getByRole("button", { name: /login/i }).click();
    await expect(page).toHaveURL("/dashboard");

    // Purchase Resources
    await page.goto("/resources/purchase");
    await page.getByLabel(/power units/i).fill("10");
    await page.getByLabel(/switch ports/i).fill("48");
    await page.getByLabel(/rack units/i).fill("42");
    await page.getByRole("button", { name: /confirm purchase/i }).click();

    await expect(page.getByText(/resources provisioned/i)).toBeVisible();
  });

  test("Step 3: Initial Inventory Creation", async () => {
    await page.goto("/inventory/add");
    await page.getByLabel(/asset name/i).fill("Core-Switch-01");
    await page.getByRole("combobox", { name: /type/i }).selectOption("Network");
    await page.getByRole("button", { name: /save item/i }).click();

    await expect(page.getByText(/inventory added/i)).toBeVisible();
  });

  // --- DAY 2: OPERATIONS & COLLABORATION ---

  test("Step 4: Update Inventory and Resource", async () => {
    await page.goto("/inventory");
    await page.getByText("Core-Switch-01").click();
    await page.getByLabel(/description/i).fill("Updated production switch");
    await page.getByRole("button", { name: /update/i }).click();

    // Update Resource capacity
    await page.goto("/resources");
    await page.getByRole("button", { name: /manage power/i }).click();
    await page.getByLabel(/limit/i).fill("20"); // Increase limit
    await page.getByRole("button", { name: /save/i }).click();
  });

  test("Step 5: Team Expansion & Multi-User Verification", async () => {
    // Add new team member
    await page.goto("/settings/team");
    await page.getByRole("button", { name: /add member/i }).click();
    await page.getByPlaceholder(/new username/i).fill("tech_user");
    await page.getByPlaceholder(/initial password/i).fill("MemberPass456!");
    await page.getByRole("button", { name: /invite/i }).click();

    // Verify new user can login (Logout admin first)
    await page.goto("/logout");
    await page.goto("/login");
    await page.getByPlaceholder(/username/i).fill("tech_user");
    await page.getByPlaceholder(/password/i).fill("MemberPass456!");
    await page.getByRole("button", { name: /login/i }).click();

    // New user creates an inventory record
    await page.goto("/inventory/add");
    await page.getByLabel(/asset name/i).fill("Member-Server-01");
    await page.getByRole("button", { name: /save item/i }).click();
    await expect(page.getByText("Member-Server-01")).toBeVisible();
  });

  // --- CLEANUP: HIERARCHICAL DELETION ---

  test("Step 6: Hierarchical Deletion (Bottom-Up)", async () => {
    // Switch back to Admin to perform cleanup
    await page.goto("/logout");
    await page.goto("/login");
    await page.getByPlaceholder(/username/i).fill("admin_user");
    await page.getByPlaceholder(/password/i).fill("SecurePass123!");
    await page.getByRole("button", { name: /login/i }).click();

    // 1. Delete ALL Inventory records first
    await page.goto("/inventory");
    const deleteButtons = await page
      .getByRole("button", { name: /delete/i })
      .all();
    for (const btn of deleteButtons) {
      await btn.click();
      await page.getByRole("button", { name: /confirm/i }).click();
    }
    await expect(page.locator(".inventory-list")).toBeEmpty();

    // 2. Delete Resources
    await page.goto("/resources");
    await page.getByRole("button", { name: /release all resources/i }).click();
    await page.getByRole("button", { name: /confirm/i }).click();

    // 3. Delete Main User (Final teardown)
    await page.goto("/settings/profile");
    await page.getByRole("button", { name: /delete account/i }).click();
    await page.getByPlaceholder(/confirm delete/i).fill("DELETE");
    await page.getByRole("button", { name: /finalize/i }).click();

    // End state: Redirected to login
    await expect(page).toHaveURL("/login");
  });
});
