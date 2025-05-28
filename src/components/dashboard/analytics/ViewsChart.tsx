
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface ViewsData {
  date: string;
  views: number;
}

interface ViewsChartProps {
  data: ViewsData[];
}

const ViewsChart: React.FC<ViewsChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem + 'T00:00:00');
    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    return days[date.getDay()];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('ViewsChart.Title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatXAxis} />
              <YAxis />
              <Tooltip labelFormatter={(label) => {
                const date = new Date(label + 'T00:00:00');
                return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              }}/>
              <Line type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} name={t('ViewsChart.ViewsLabel')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewsChart;
