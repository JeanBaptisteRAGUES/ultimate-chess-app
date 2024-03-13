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
                display: false,
                position: 'top' as const,
            },
            title: {
            display: false,
            text: 'Chart.js Line Chart',
            },
        },
        scales: {
            y: {
                suggestedMin: -5,
                suggestedMax: 5,
                ticks: {
                    // Include a dollar sign in the ticks
                    callback: function(value: any, index: any, ticks: any) {
                        return '';
                    }
                }
            }
        }
    };
      
    const labels = historyData.historyData.map(() => '');
    //console.log(labels);
    //TODO: Essayer de faire en sorte que les labels donnent le score: chartjs doc -> Axes -> Labeling Axes -> Creating Custom Tick Formats
      
    const data = {
        labels,
        datasets: [
            {
                fill: {
                    target: {value: 0}, // 3. Set the fill options
                    above: "rgba(255, 255, 255, 1)",
                    below: "rgba(0,0,0,1)"
                },
                label: 'Eval',
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