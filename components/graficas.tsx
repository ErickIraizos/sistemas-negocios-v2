'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Treemap,
  Funnel,
  FunnelChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface QueryRecord {
  id: number;
  query: string;
  timestamp: string;
  columns: string[];
  rows: any[];
}

type ChartType = 'bar' | 'barh' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'composed' | 'treemap' | 'funnel' | 'heatmap';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export function Graficas() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<QueryRecord[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<QueryRecord | null>(null);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [chartData, setChartData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const stored = localStorage.getItem('sqlHistory');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  };

  const handleQuerySelect = (query: QueryRecord) => {
    setSelectedQuery(query);
    generateChartFromQuery(query);
  };

  const generateChartFromQuery = (query: QueryRecord) => {
    setError(null);
    
    if (query.rows.length === 0) {
      setError('La consulta no devolvió resultados');
      setChartData([]);
      return;
    }

    const firstRow = query.rows[0];
    const columns = query.columns;

    if (columns.length === 0) {
      setError('La consulta no contiene columnas');
      setChartData([]);
      return;
    }

    // Detectar automáticamente la primera columna numérica y la primera columna de texto
    let numericColumn = '';
    let labelColumn = '';

    for (let col of columns) {
      if (!labelColumn && typeof firstRow[col] === 'string') {
        labelColumn = col;
      }
      if (!numericColumn && typeof firstRow[col] === 'number') {
        numericColumn = col;
      }
      if (labelColumn && numericColumn) break;
    }

    // Si no hay columna de texto, usar la primera columna como etiqueta
    if (!labelColumn) {
      labelColumn = columns[0];
    }
    // Si no hay columna numérica, usar la segunda columna
    if (!numericColumn) {
      numericColumn = columns[columns.length - 1];
    }

    // Transformar datos para la gráfica
    let data = query.rows.map((row) => ({
      name: String(row[labelColumn] ?? 'Sin valor'),
      value: isNaN(Number(row[numericColumn])) ? 0 : Number(row[numericColumn]),
    }));

    // Para gráficas de embudo, ordenar datos de mayor a menor
    if (chartType === 'funnel') {
      data = [...data].sort((a, b) => b.value - a.value);
    }

    setChartData(data);
  };

  const handleChartTypeChange = (type: ChartType) => {
    setChartType(type);
  };

  const downloadPDF = async () => {
    if (!selectedQuery || chartData.length === 0) return;

    setDownloading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();

      // Título
      pdf.setFontSize(16);
      pdf.setTextColor(30, 30, 30);
      pdf.text('Reporte de Gráfica', 20, 20);

      // Tipo de gráfica
      pdf.setFontSize(12);
      pdf.text(`Tipo: ${getChartTypeName(chartType)}`, 20, 30);

      // Información de la consulta
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      const consultaTruncada = selectedQuery.query.length > 100 
        ? selectedQuery.query.substring(0, 100) + '...' 
        : selectedQuery.query;
      pdf.text(`Consulta: ${consultaTruncada}`, 20, 40);
      pdf.text(`Fecha: ${new Date(selectedQuery.timestamp).toLocaleString('es-ES')}`, 20, 48);

      // Intentar capturar la gráfica si está disponible
      if (chartRef.current) {
        try {
          const canvas = await html2canvas(chartRef.current, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Validar que la altura sea razonable
          if (imgHeight < 250) {
            pdf.addImage(imgData, 'PNG', 20, 56, imgWidth, imgHeight);
          }
        } catch (canvasError) {
          console.error('No se pudo capturar la gráfica:', canvasError);
          // Continuar sin la imagen si falla la captura
        }
      }

      // Nueva página para métricas
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setTextColor(30, 30, 30);
      pdf.text('Análisis Detallado de Métricas', 20, 20);

      // Información de datos
      pdf.setFontSize(10);
      pdf.setTextColor(30, 30, 30);
      let yPos = 35;
      
      pdf.text('Resumen de Datos:', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Total de registros: ${chartData.length}`, 25, yPos);
      yPos += 8;

      // Estadísticas
      const values = chartData.map((d) => d.value);
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);

      pdf.text(`Suma total: ${sum.toLocaleString('es-ES')}`, 25, yPos);
      yPos += 8;
      pdf.text(`Promedio: ${avg.toFixed(2)}`, 25, yPos);
      yPos += 8;
      pdf.text(`Máximo: ${max.toLocaleString('es-ES')}`, 25, yPos);
      yPos += 8;
      pdf.text(`Mínimo: ${min.toLocaleString('es-ES')}`, 25, yPos);
      yPos += 15;

      // Detalles por elemento
      pdf.text('Detalles por Elemento:', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(8);
      chartData.forEach((item, idx) => {
        const percentage = ((item.value / sum) * 100).toFixed(2);
        const text = `${idx + 1}. ${item.name}: ${item.value.toLocaleString('es-ES')} (${percentage}%)`;
        
        // Manejo de saltos de página
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.text(text, 25, yPos);
        yPos += 7;
      });

      // Interpretación
      yPos += 10;
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(10);
      pdf.text('Interpretación:', 20, yPos);
      yPos += 10;

      pdf.setFontSize(9);
      const interpretation = generateInterpretation(chartData, chartType);
      const splitText = pdf.splitTextToSize(interpretation, pageWidth - 40);
      pdf.text(splitText, 25, yPos);

      pdf.save(`grafica_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Error al descargar el PDF');
    } finally {
      setDownloading(false);
    }
  };

  const getChartTypeName = (type: ChartType): string => {
    const names: Record<ChartType, string> = {
      bar: 'Gráfica de Barras Vertical',
      barh: 'Gráfica de Barras Horizontal',
      line: 'Gráfica de Línea',
      pie: 'Gráfica de Pastel',
      area: 'Gráfica de Área',
      scatter: 'Gráfica de Dispersión',
      radar: 'Gráfica de Radar',
      composed: 'Gráfica Compuesta',
      treemap: 'Mapa de Árbol',
      funnel: 'Gráfica de Embudo',
      heatmap: 'Gráfica de Calor (Heatmap)',
    };
    return names[type];
  };

  const generateInterpretation = (data: any[], type: ChartType): string => {
    const values = data.map((d) => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const max = Math.max(...values);
    const maxItem = data.find((d) => d.value === max);
    const min = Math.min(...values);
    const minItem = data.find((d) => d.value === min);

    let interpretation = '';

    switch (type) {
      case 'bar':
        interpretation = `La gráfica de barras horizontal muestra ${data.length} categorías de forma intuitiva. El valor máximo es "${maxItem?.name}" con ${max.toLocaleString('es-ES')} unidades. El valor mínimo es "${minItem?.name}" con ${min.toLocaleString('es-ES')} unidades. El total combinado es ${sum.toLocaleString('es-ES')}. Este formato es ideal para muchas categorías.`;
        break;
      case 'barh':
        interpretation = `La gráfica de barras horizontal muestra ${data.length} categorías en forma legible. El valor máximo es "${maxItem?.name}" con ${max.toLocaleString('es-ES')} unidades. El valor mínimo es "${minItem?.name}" con ${min.toLocaleString('es-ES')} unidades. El total es ${sum.toLocaleString('es-ES')}. Excelente para comparación visual de categorías.`;
        break;
      case 'line':
        interpretation = `La gráfica de línea representa una tendencia con ${data.length} puntos de datos. El valor más alto registrado fue ${max.toLocaleString('es-ES')} en "${maxItem?.name}". El total acumulado es ${sum.toLocaleString('es-ES')}. Esta visualización es útil para identificar patrones y tendencias a lo largo del tiempo.`;
        break;
      case 'pie':
        interpretation = `La gráfica de pastel muestra la distribución de ${data.length} categorías. El segmento mayor es "${maxItem?.name}" representando ${((max / sum) * 100).toFixed(2)}% del total. El segmento menor es "${minItem?.name}" con ${((min / sum) * 100).toFixed(2)}% del total. El total es ${sum.toLocaleString('es-ES')}.`;
        break;
      case 'area':
        interpretation = `La gráfica de área ilustra ${data.length} series de datos con un total de ${sum.toLocaleString('es-ES')}. El pico máximo alcanzado fue ${max.toLocaleString('es-ES')} en "${maxItem?.name}". Esta visualización facilita la comprensión de magnitudes y sus cambios.`;
        break;
      case 'scatter':
        interpretation = `La gráfica de dispersión muestra ${data.length} puntos de datos. Los valores varían desde ${min.toLocaleString('es-ES')} hasta ${max.toLocaleString('es-ES')}. El promedio es ${(sum / data.length).toFixed(2)}. Esta visualización es útil para identificar correlaciones y patrones en los datos.`;
        break;
      case 'radar':
        interpretation = `La gráfica de radar presenta ${data.length} dimensiones. El máximo valor es ${max.toLocaleString('es-ES')} (${maxItem?.name}). Esta visualización permite comparar múltiples variables simultáneamente.`;
        break;
      case 'composed':
        interpretation = `La gráfica compuesta combina barras y línea para mostrar ${data.length} puntos de datos. El valor más alto es ${max.toLocaleString('es-ES')} en "${maxItem?.name}". Esta doble representación permite un análisis más profundo.`;
        break;
      case 'treemap':
        interpretation = `El mapa de árbol representa ${data.length} elementos con tamaños proporcionales a sus valores. El elemento más grande es "${maxItem?.name}" con ${max.toLocaleString('es-ES')} unidades. El total es ${sum.toLocaleString('es-ES')}.`;
        break;
      case 'funnel':
        interpretation = `La gráfica de embudo muestra un proceso de ${data.length} etapas en orden descendente. La primera etapa tiene ${data[0]?.value} unidades y la última ${data[data.length - 1]?.value} unidades. Esto representa una reducción del ${(((data[0]?.value - data[data.length - 1]?.value) / data[0]?.value) * 100).toFixed(2)}%.`;
        break;
      case 'heatmap':
        interpretation = `El mapa de calor representa ${data.length} valores con codificación de colores. El valor máximo es ${max.toLocaleString('es-ES')} (${maxItem?.name}) mostrado en azul oscuro. El valor mínimo es ${min.toLocaleString('es-ES')} (${minItem?.name}) mostrado en azul claro. La intensidad del color indica la magnitud relativa del valor.`;
        break;
      default:
        interpretation = `Gráfica con ${data.length} elementos. Total: ${sum.toLocaleString('es-ES')}.`;
    }

    return interpretation;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Generador de Gráficas</h1>
        <p className="text-gray-400">Crea gráficas a partir de tus consultas guardadas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Selección de Consulta */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base">Consultas Guardadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {history.length === 0 ? (
                <p className="text-gray-400 text-sm">No hay consultas en el historial</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {history.map((query) => (
                    <div
                      key={query.id}
                      onClick={() => handleQuerySelect(query)}
                      className={`p-2 rounded-lg cursor-pointer transition-colors text-sm ${
                        selectedQuery?.id === query.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      <code className="break-all text-xs">{query.query.substring(0, 50)}...</code>
                      <div className="text-xs text-gray-400 mt-1">{query.rows.length} filas</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tipo de Gráfica */}
        {selectedQuery && (
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base">Selecciona Tipo de Gráfica</CardTitle>
                <p className="text-gray-400 text-xs mt-2">Elige según tu objetivo: comparar, mostrar tendencias, proporciones, correlaciones, etc.</p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 flex-wrap">
                  {['bar', 'barh', 'line', 'pie', 'area', 'scatter', 'radar', 'composed', 'treemap', 'funnel', 'heatmap'].map((type) => {
                    const labels: Record<string, string> = {
                      bar: 'Barras V',
                      barh: 'Barras H',
                      line: 'Línea',
                      pie: 'Pastel',
                      area: 'Área',
                      scatter: 'Dispersión',
                      radar: 'Radar',
                      composed: 'Compuesta',
                      treemap: 'Árbol',
                      funnel: 'Embudo',
                      heatmap: 'Calor',
                    };
                    const descriptions: Record<string, string> = {
                      bar: 'Barras verticales - Compara valores',
                      barh: 'Barras horizontales - Más legible para muchas categorías',
                      line: 'Muestra tendencias en el tiempo',
                      pie: 'Visualiza proporciones del total',
                      area: 'Representa magnitudes acumuladas',
                      scatter: 'Identifica correlaciones',
                      radar: 'Compara múltiples variables',
                      composed: 'Análisis con barras y línea',
                      treemap: 'Proporciones jerárquicas',
                      funnel: 'Procesos con etapas decrecientes',
                      heatmap: 'Matriz de colores - Datos bidimensionales',
                    };
                    return (
                      <div key={type} title={descriptions[type]} className="relative group">
                        <Button
                          onClick={() => handleChartTypeChange(type as ChartType)}
                          className={`text-sm px-4 py-2 transition-all ${
                            chartType === type
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          }`}
                        >
                          {labels[type]}
                        </Button>
                        <div className="absolute hidden group-hover:block bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10 border border-slate-600">
                          {descriptions[type]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Descripción del Tipo Seleccionado */}
            <Card className="bg-slate-800 border border-blue-600 border-opacity-30">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-300">
                  <span className="font-semibold">💡 Tipo Seleccionado: </span>
                  {chartType === 'bar'
                    ? 'Gráfica de Barras - Perfecta para comparar valores entre diferentes categorías. Cada barra representa un elemento.'
                    : chartType === 'line'
                      ? 'Gráfica de Línea - Ideal para mostrar tendencias y cambios a lo largo del tiempo. Útil para series históricas.'
                      : chartType === 'pie'
                        ? 'Gráfica de Pastel - Visualiza cómo se distribuye el total entre diferentes partes. Cada segmento es una proporción.'
                        : chartType === 'area'
                          ? 'Gráfica de Área - Muestra magnitudes acumuladas. La altura del área representa el valor.'
                          : chartType === 'scatter'
                            ? 'Gráfica de Dispersión - Identifica patrones y correlaciones entre variables. Cada punto es un dato.'
                            : chartType === 'radar'
                              ? 'Gráfica de Radar - Compara múltiples variables en forma radial. Útil para perfiles completos.'
                              : chartType === 'composed'
                                ? 'Gráfica Compuesta - Combina barras y línea para análisis más profundo. Dos perspectivas en una.'
                                : chartType === 'treemap'
                                  ? 'Mapa de Árbol - Muestra proporciones jerárquicas. El tamaño de cada rectángulo es proporcional al valor.'
                                  : 'Gráfica de Embudo - Muestra un proceso con etapas. Cada nivel es más pequeño que el anterior.'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-900/20 border border-red-700 col-span-full mt-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-semibold">No se puede generar la gráfica</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
                <p className="text-red-300 text-xs mt-2">Asegúrate de que la consulta devuelva datos válidos con al menos una columna de texto y una numérica.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráfica */}
      {chartData.length > 0 && selectedQuery && !error && (
        <div className="col-span-full mt-6 space-y-4">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                {chartType === 'bar'
                  ? 'Gráfica de Barras'
                  : chartType === 'line'
                    ? 'Gráfica de Línea'
                    : chartType === 'pie'
                      ? 'Gráfica de Pastel'
                      : chartType === 'area'
                        ? 'Gráfica de Área'
                        : chartType === 'scatter'
                          ? 'Gráfica de Dispersión'
                          : chartType === 'radar'
                            ? 'Gráfica de Radar'
                            : chartType === 'composed'
                              ? 'Gráfica Compuesta'
                              : chartType === 'treemap'
                                ? 'Mapa de Árbol'
                                : 'Gráfica de Embudo'}
              </CardTitle>
            </CardHeader>
          <CardContent>
            <div ref={chartRef} className="bg-slate-900 p-4 rounded-lg mb-4">
              <ResponsiveContainer width="100%" height={400}>
              {chartType === 'bar' ? (
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #4B5563',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#FFF' }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                </BarChart>
              ) : chartType === 'barh' ? (
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #4B5563',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#FFF' }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#10B981" radius={[0, 8, 8, 0]} />
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #4B5563',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#FFF' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                </LineChart>
              ) : chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #4B5563',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#FFF' }}
                  />
                </PieChart>
              ) : chartType === 'area' ? (
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #4B5563',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#FFF' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="value" fill="#8B5CF6" stroke="#8B5CF6" />
                </AreaChart>
              ) : chartType === 'scatter' ? (
                <ScatterChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" type="number" />
                  <YAxis dataKey="value" stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #4B5563',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#FFF' }}
                  />
                  <Scatter name="Valores" dataKey="value" fill="#EC4899" />
                </ScatterChart>
              ) : chartType === 'radar' ? (
                <RadarChart data={chartData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="name" stroke="#9CA3AF" />
                  <PolarRadiusAxis stroke="#9CA3AF" />
                  <Radar name="Valor" dataKey="value" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.6} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #4B5563',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#FFF' }}
                  />
                  <Legend />
                </RadarChart>
              ) : chartType === 'composed' ? (
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #4B5563',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#FFF' }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                  <Line type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={2} dot={false} />
                </ComposedChart>
              ) : chartType === 'treemap' ? (
                <Treemap
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  stroke="#8884d8"
                  fill="#3B82F6"
                  content={<CustomTreemapContent />}
                />
              ) : chartType === 'funnel' ? (
                <FunnelChart width={730} height={400}>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #4B5563',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#FFF' }}
                  />
                  <Funnel dataKey="value" data={chartData} fill="#3B82F6" shape="linear">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Funnel>
                </FunnelChart>
              ) : chartType === 'heatmap' ? (
                <div className="w-full h-full bg-slate-900 rounded-lg p-4 flex items-center justify-center">
                  <HeatmapChart data={chartData} />
                </div>
              ) : null}
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <Button
                onClick={downloadPDF}
                disabled={downloading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Download className="w-4 h-4" />
                {downloading ? 'Descargando...' : 'Descargar como PDF con Análisis Completo'}
              </Button>

              {/* Interpretación Rápida */}
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                <p className="text-sm font-semibold text-white mb-3">Resumen Rápido:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-700 rounded p-2">
                    <p className="text-gray-400">Total</p>
                    <p className="text-blue-400 font-bold">{chartData.reduce((sum, d) => sum + d.value, 0).toLocaleString('es-ES')}</p>
                  </div>
                  <div className="bg-slate-700 rounded p-2">
                    <p className="text-gray-400">Promedio</p>
                    <p className="text-green-400 font-bold">{(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length).toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-700 rounded p-2">
                    <p className="text-gray-400">Máximo</p>
                    <p className="text-orange-400 font-bold">{Math.max(...chartData.map(d => d.value)).toLocaleString('es-ES')}</p>
                  </div>
                  <div className="bg-slate-700 rounded p-2">
                    <p className="text-gray-400">Elementos</p>
                    <p className="text-purple-400 font-bold">{chartData.length}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  El PDF incluirá estadísticas completas, porcentajes de cada elemento e interpretación detallada.
                </p>
              </div>
            </div>
          </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

const HeatmapChart = ({ data }: { data: any[] }) => {
  if (data.length < 4) {
    return (
      <div className="text-center text-gray-400">
        <p>Se necesitan más datos para un heatmap</p>
        <p className="text-xs mt-2">Mínimo 4 registros recomendado</p>
      </div>
    );
  }

  // Crear matriz de datos para el heatmap
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-1 p-4">
        <div className="flex flex-col gap-1 pr-4">
          {data.map((item, idx) => (
            <div key={`label-${idx}`} className="h-8 flex items-center text-xs text-gray-300 w-32 text-right pr-2">
              {item.name}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {data.map((item, idx) => {
            const intensity = ((item.value - minValue) / (maxValue - minValue)) * 255;
            const isLight = intensity > 128;
            
            return (
              <div
                key={`cell-${idx}`}
                className="h-8 px-4 flex items-center justify-center rounded text-xs font-bold text-white transition-all hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: `rgb(${Math.floor(intensity * 0.5)}, ${Math.floor(100 + intensity * 0.5)}, 255)`,
                  minWidth: '80px',
                }}
                title={`${item.name}: ${item.value}`}
              >
                {item.value.toLocaleString('es-ES')}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-6 px-4 text-xs text-gray-400">
        <p>Escala de color: Azul claro (bajo) → Azul oscuro (alto)</p>
      </div>
    </div>
  );
};

const CustomTreemapContent = (props: any) => {
  const { x, y, width, height, name, value } = props;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} style={{ fill: '#3B82F6', stroke: '#1F2937', strokeWidth: 2 }} />
      <text
        x={x + width / 2}
        y={y + height / 2 - 7}
        textAnchor="middle"
        fill="#fff"
        fontSize={14}
        fontWeight="bold"
      >
        {name}
      </text>
      <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={12}>
        {value}
      </text>
    </g>
  );
}
