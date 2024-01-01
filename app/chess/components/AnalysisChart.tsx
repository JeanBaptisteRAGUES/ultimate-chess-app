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


export function AnalysisChart(historyData: any) {
    const options = {
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
    console.log(historyData);
    console.log(historyData.historyData);
    const labels = historyData.historyData.map(() => '');
    console.log(labels);
      
    const data = {
        labels,
        datasets: [
            {
                fill: {
                    target: {value: 0}, // 3. Set the fill options
                    above: "rgba(255, 255, 255, 1)",
                    below: "rgba(0,0,0,1)"
                },
                label: '',
                data: historyData.historyData,
                borderColor: 'rgba(255, 255, 255,0)',
                backgroundColor: 'rgba(255, 255, 255, 0)',
            },
        ],
    };
    return <Line options={options} data={data} />;
}