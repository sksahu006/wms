'use client';

import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardChartsProps {
  chartType: "revenue" | "monthlyRevenue" | "warehouseUtilization" | "clientDistribution";
  data: any[];
}

export default function DashboardCharts({ chartType, data }: DashboardChartsProps) {
  if (chartType === "revenue") {
    return (
      <Line
        data={{
          labels: data.map(d => d.date),
          datasets: [
            {
              label: "Revenue (₹)",
              data: data.map(d => d.revenue),
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Daily Revenue (Last 7 Days)" },
          },
        }}
        height={200}
      />
    );
  }

  if (chartType === "monthlyRevenue") {
    return (
      <Line
        data={{
          labels: data.map(d => d.month),
          datasets: [
            {
              label: "Revenue (₹)",
              data: data.map(d => d.revenue),
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Monthly Revenue Trend" },
          },
        }}
        height={300}
      />
    );
  }

  if (chartType === "warehouseUtilization") {
    return (
      <Bar
        data={{
          labels: data.map(d => d.name),
          datasets: [
            {
              label: "Utilization (%)",
              data: data.map(d => d.utilization),
              backgroundColor: "rgba(54, 162, 235, 0.5)",
              borderColor: "rgb(54, 162, 235)",
              borderWidth: 1,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Warehouse Utilization" },
          },
        }}
        height={300}
      />
    );
  }

  if (chartType === "clientDistribution") {
    return (
      <Pie
        data={{
          labels: data.map(d => d.type),
          datasets: [
            {
              label: "Client Distribution",
              data: data.map(d => d.count),
              backgroundColor: [
                "rgba(255, 99, 132, 0.5)",
                "rgba(54, 162, 235, 0.5)",
                "rgba(255, 206, 86, 0.5)",
                "rgba(75, 192, 192, 0.5)",
              ],
              borderColor: [
                "rgb(255, 99, 132)",
                "rgb(54, 162, 235)",
                "rgb(255, 206, 86)",
                "rgb(75, 192, 192)",
              ],
              borderWidth: 1,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Client Distribution" },
          },
        }}
        height={300}
      />
    );
  }

  return null;
}