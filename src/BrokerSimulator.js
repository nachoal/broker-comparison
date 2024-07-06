import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BrokerSimulator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [exchangeRate, setExchangeRate] = useState(17.5);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [years, setYears] = useState(1);
  const [chartType, setChartType] = useState('line');

  const calculateFees = (broker, amount) => {
    switch(broker) {
      case 'GBM':
        return amount * 0.0025;
      case 'Actinver':
        return amount * 0.0025 + (500 / 12);
      case 'IBKR':
        return Math.min(amount * 0.0035, amount * 0.01);
      default:
        return 0;
    }
  };

  const simulateInvestment = useCallback(() => {
    const months = Math.max(1, Math.floor(years)) * 12;
    const monthlyReturnRate = Math.pow(1 + annualReturn / 100, 1/12) - 1;
    
    let data = Array(months).fill().map((_, month) => {
      const baseAmount = monthlyInvestment * (month + 1);
      
      const results = ['GBM', 'Actinver', 'IBKR'].map(broker => {
        let totalValue = 0;
        let totalFees = 0;
        for (let i = 0; i <= month; i++) {
          const monthlyInvestmentUSD = monthlyInvestment / exchangeRate;
          const fee = calculateFees(broker, monthlyInvestmentUSD);
          totalFees += fee;
          totalValue = (totalValue + monthlyInvestmentUSD - fee) * (1 + monthlyReturnRate);
        }
        return {
          broker,
          totalValue: totalValue * exchangeRate,
          totalFees: totalFees * exchangeRate,
        };
      });

      return {
        month: month + 1,
        invested: baseAmount,
        GBM: results[0].totalValue,
        Actinver: results[1].totalValue,
        IBKR: results[2].totalValue,
        GBMFees: results[0].totalFees,
        ActinverFees: results[1].totalFees,
        IBKRFees: results[2].totalFees,
      };
    });

    return data;
  }, [monthlyInvestment, exchangeRate, annualReturn, years]);

  const [data, setData] = useState(simulateInvestment());

  useEffect(() => {
    setData(simulateInvestment());
  }, [monthlyInvestment, exchangeRate, annualReturn, years, simulateInvestment]);

  const handleYearsChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setYears('');
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        setYears(Math.min(Math.max(numValue, 1), 1000)); // Allow up to 1000 years
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Simulador de Comparación de Inversiones entre Brokers</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Inversión Mensual (MXN)</label>
          <input
            type="number"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(Math.max(0, Number(e.target.value)))}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Cambio (MXN/USD)</label>
          <input
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(Math.max(0.01, Number(e.target.value)))}
            min="0.01"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rendimiento Anual (%)</label>
          <input
            type="number"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(Number(e.target.value))}
            step="0.1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Años</label>
          <input
            type="number"
            value={years}
            onChange={handleYearsChange}
          onBlur={() => {
            if (years === '' || years < 1) setYears(1);
            if (years > 1000) setYears(1000);
          }}
            min="1"
            max="1000"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Tipo de Gráfico</label>
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="line">Gráfico de Líneas</option>
          <option value="bar">Gráfico de Barras</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        {chartType === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" label={{ value: 'Meses', position: 'insideBottomRight', offset: -10 }} />
            <YAxis label={{ value: 'Valor (MXN)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="invested" stroke="#8884d8" name="Invertido" />
            <Line type="monotone" dataKey="GBM" stroke="#82ca9d" name="GBM" />
            <Line type="monotone" dataKey="Actinver" stroke="#ffc658" name="Actinver" />
            <Line type="monotone" dataKey="IBKR" stroke="#ff7300" name="IBKR" />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" label={{ value: 'Meses', position: 'insideBottomRight', offset: -10 }} />
            <YAxis label={{ value: 'Valor (MXN)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="invested" fill="#8884d8" name="Invertido" />
            <Bar dataKey="GBM" fill="#82ca9d" name="GBM" />
            <Bar dataKey="Actinver" fill="#ffc658" name="Actinver" />
            <Bar dataKey="IBKR" fill="#ff7300" name="IBKR" />
          </BarChart>
        )}
      </ResponsiveContainer>
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Comisiones Totales Después de {years} Año(s)</h3>
        <ul className="list-disc pl-5">
          <li>GBM: {data[data.length - 1].GBMFees.toFixed(2)} MXN</li>
          <li>Actinver: {data[data.length - 1].ActinverFees.toFixed(2)} MXN</li>
          <li>IBKR: {data[data.length - 1].IBKRFees.toFixed(2)} MXN</li>
        </ul>
      </div>
    </div>
  );
};

export default BrokerSimulator;