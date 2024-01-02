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
        scales: {
            y: {
                suggestedMin: 0,
                suggestedMax: 100
            }
        }
    };
      
    //const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
    console.log(historyData);
    console.log(historyData.historyData);
    const labels = historyData.historyData.map(() => '');
    console.log(labels);
    //TODO: Essayer de faire en sorte que les labels donnent le score: chartjs doc -> Axes -> Labeling Axes -> Creating Custom Tick Formats
      
    const data = {
        labels,
        datasets: [
            {
                fill: {
                    target: {value: 50}, // 3. Set the fill options
                    above: "rgba(255, 255, 255, 1)",
                    below: "rgba(0,0,0,1)"
                },
                label: '',
                data: historyData.historyData,
                borderColor: 'rgba(255, 100, 255, 1)',
                backgroundColor: 'rgba(255, 255, 255, 0)',
                pointStyle: false,
                borderWidth: 1,
            },
        ],
    };
    //@ts-ignore
    return <Line options={options} data={data} className=' bg-zinc-700' />;
}