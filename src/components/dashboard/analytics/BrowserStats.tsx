
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';

interface BrowserStat {
  browser: string;
  views: number;
  percentage: number;
}

interface BrowserStatsProps {
  stats: BrowserStat[];
}

const BrowserStats: React.FC<BrowserStatsProps> = ({ stats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Browser Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Browser</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((stat) => (
              <TableRow key={stat.browser}>
                <TableCell>{stat.browser}</TableCell>
                <TableCell className="text-right">{stat.views}</TableCell>
                <TableCell className="text-right">{stat.percentage.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BrowserStats;
