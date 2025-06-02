
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

interface ViewsData {
  date: string; // s'attendra à YYYY-MM-DD
  views: number;
}

interface ViewsChartProps {
  data: ViewsData[];
}

const ViewsChart: React.FC<ViewsChartProps> = ({ data }) => {
  const formatXAxis = (tickItem: string) => {
    // tickItem est la date string, ex: "2025-05-27"
    const date = new Date(tickItem + 'T00:00:00'); // Assurer que la date est interprétée en local
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vues au fil du temps</CardTitle>
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
                return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              }}/>
              <Line type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} name="Vues" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewsChart;
