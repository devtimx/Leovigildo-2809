import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { SnailStat } from '../../types/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SnailBarChartProps {
  stats: SnailStat[];
}

// Un color por competidor (orden estable = orden de los caracoles en el backend)
const SNAIL_COLORS = [
  '#6366F1', // Turbo - índigo
  '#10B981', // Chicotazo - esmeralda
  '#F59E0B', // Pólvora - ámbar
  '#EF4444', // Derrapón - rojo
  '#06B6D4', // Pepe Maniobra - cian
  '#8B5CF6', // Goyo Ganador - púrpura
];

export const SnailBarChart: React.FC<SnailBarChartProps> = ({ stats = [] }) => {
  const data = {
    labels: stats.map((s) => s.name || `Caracol ${s.id}`),
    datasets: [
      {
        label: 'Victorias',
        data: stats.map((s) => s.wins),
        backgroundColor: stats.map((_, index) => SNAIL_COLORS[index % SNAIL_COLORS.length]),
        borderColor: stats.map((_, index) => SNAIL_COLORS[index % SNAIL_COLORS.length]),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="w-full h-64">
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1, precision: 0 },
            },
          },
        }}
      />
    </div>
  );
};
