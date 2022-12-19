import React from 'react';
import { EuiLoadingChart } from '@elastic/eui';

interface ChartContainerProps {
  loading?: boolean;
  chartViewId: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ chartViewId, loading = false }) => {
  return (
    <div className="chart-view-container">
      {loading && (
        <>
          <EuiLoadingChart size="xl" className="chart-view-container-loading" />
          <div className="chart-view-container-mask"></div>
        </>
      )}
      <div id={chartViewId}></div>
    </div>
  );
};
