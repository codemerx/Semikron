import "https://cdn.jsdelivr.net/npm/chart.js";

export function createChart({ canvas, data, labelName, series }) {
  new Chart(canvas, {
    data: {
      labels: data.map((row) => row[labelName]),
      datasets: series.map((x) => ({
        type: x.type || "bar",
        label: x.name,
        data: data.map((row) => row[x.valueName]),
      })),
    },
  });
}
