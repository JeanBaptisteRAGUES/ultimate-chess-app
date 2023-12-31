import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { tree } from 'next/dist/build/templates/app-page';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Chart.js Line Chart',
    },
  },
};

//const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
const labels = ['','','','','','',''];

export const data = {
  labels,
  datasets: [
    {
        fill: {
            target: {value: 0}, // 3. Set the fill options
            above: "rgba(255, 255, 255, 1)",
            below: "rgba(0,0,0,1)"
        },
        label: '',
        data: [1,4,3,-2,0,5,7],
        borderColor: 'rgba(255, 255, 255,0)',
        backgroundColor: 'rgba(255, 255, 255, 0)',
    },
  ],
};


export function AnalysisChart() {
  return <Line options={options} data={data} />;
}