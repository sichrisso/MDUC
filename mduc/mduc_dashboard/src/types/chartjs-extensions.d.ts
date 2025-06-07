import "chart.js";

declare module "chart.js" {
  interface ChartTypeRegistry {
    violin: {
      chartOptions: Chart.ChartOptions;
      datasetOptions: {
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: number;
      };
      defaultDataPoint: number[];
      parsedDataType: number[];
      scaleType: "linear";
    };
  }
}
