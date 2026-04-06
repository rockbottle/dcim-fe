"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface GaugeProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

const GaugeChart = ({ label, value, max, color }: GaugeProps) => {
  // Data: [Value, Remaining Space]
  const data = [
    { value: value },
    { value: max - value },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">{label}</h3>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%" // Move center down to create half-circle look
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell key="cell-0" fill={color} />
              <Cell key="cell-1" fill="#e5e7eb" /> {/* Gray background for "empty" part */}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="text-2xl font-extrabold -mt-8 dark:text-white">
        {value} <span className="text-xs text-gray-400">/ {max}</span>
      </div>
    </div>
  );
};

export default GaugeChart;