import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface BetsDonutChartProps {
  won: number;
  lost: number;
}

export const BetsDonutChart: React.FC<BetsDonutChartProps> = ({ won = 0, lost = 0 }) => {
  const data = {
    labels: ['Ganadas', 'Perdidas'],
    datasets: [
      {
        data: [won, lost],
        backgroundColor: ['#10B981', '#EF4444'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-full h-64 flex justify-center items-center">
      <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};