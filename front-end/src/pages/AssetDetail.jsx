import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Card, Row, Col, Typography, Segmented, Checkbox, Button, Alert, Spin, Space, Tag } from 'antd';
import {
    ArrowLeftOutlined,
    SwapOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/apiService';
import { formatPrice, formatCompact, cryptoLabel } from '../utils/format';
import { sma, rsi, macd, adx } from '../utils/indicators';

const { Title, Text } = Typography;

const RANGE_OPTIONS = [
    { label: '7D', value: 7 },
    { label: '30D', value: 30 },
    { label: '90D', value: 90 },
    { label: '180D', value: 180 },
    { label: '1Y', value: 365 },
];

const INDICATOR_OPTIONS = [
    { label: 'Moving averages (SMA 20/50)', value: 'MA' },
    { label: 'RSI (14)', value: 'RSI' },
    { label: 'MACD (12/26/9)', value: 'MACD' },
    { label: 'ADX (14)', value: 'ADX' },
];

const CHART_HEIGHT = 320;
const SUB_CHART_HEIGHT = 200;

export default function AssetDetail() {
    const { cryptoId } = useParams();
    const navigate = useNavigate();
    const [ohlc, setOhlc] = useState([]);
    const [currentInfo, setCurrentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [days, setDays] = useState(30);
    const [activeIndicators, setActiveIndicators] = useState(['MA', 'RSI']);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [history, price] = await Promise.all([
                apiService.getOhlc(cryptoId, days),
                apiService.getPrice(cryptoId).catch(() => null),
            ]);
            setOhlc(history || []);
            setCurrentInfo(price);
        } catch (err) {
            setError(err.message || 'Unable to load the price history.');
        } finally {
            setLoading(false);
        }
    }, [cryptoId, days]);

    useEffect(() => {
        load();
    }, [load]);

    const closes = useMemo(() => ohlc.map((c) => Number(c.close)), [ohlc]);
    // On garde de vrais objets Date (et non des libellés textuels) comme champ X : plusieurs bougies
    // peuvent partager le même jour calendaire (ex : granularité 4h sur 30 jours), et un axe
    // catégoriel les empilerait sous le même label, cassant l'ordre chronologique du tracé.
    const dates = useMemo(() => ohlc.map((c) => new Date(c.timestamp)), [ohlc]);
    const axisConfig = useMemo(
        () => ({
            x: {
                labelFormatter: (d) =>
                    new Date(d).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        ...(days <= 7 ? { hour: '2-digit' } : {}),
                    }),
            },
        }),
        [days],
    );

    const sma20 = useMemo(() => sma(closes, 20), [closes]);
    const sma50 = useMemo(() => sma(closes, 50), [closes]);
    const rsi14 = useMemo(() => rsi(closes, 14), [closes]);
    const macdResult = useMemo(() => macd(closes, 12, 26, 9), [closes]);
    const adxResult = useMemo(
        () =>
            adx(
                ohlc.map((c) => ({ high: Number(c.high), low: Number(c.low), close: Number(c.close) })),
                14,
            ),
        [ohlc],
    );

    const showMA = activeIndicators.includes('MA');
    const showRSI = activeIndicators.includes('RSI');
    const showMACD = activeIndicators.includes('MACD');
    const showADX = activeIndicators.includes('ADX');

    const priceChartData = useMemo(() => {
        const rows = [];
        dates.forEach((date, i) => {
            rows.push({ date, value: closes[i], series: 'Price' });
            if (showMA) {
                if (sma20[i] != null) rows.push({ date, value: sma20[i], series: 'SMA 20' });
                if (sma50[i] != null) rows.push({ date, value: sma50[i], series: 'SMA 50' });
            }
        });
        return rows;
    }, [dates, closes, sma20, sma50, showMA]);

    const rsiChartData = useMemo(() => {
        const rows = [];
        dates.forEach((date, i) => {
            if (rsi14[i] != null) rows.push({ date, value: rsi14[i], series: 'RSI' });
            rows.push({ date, value: 70, series: 'Overbought (70)' });
            rows.push({ date, value: 30, series: 'Oversold (30)' });
        });
        return rows;
    }, [dates, rsi14]);

    const macdLineData = useMemo(() => {
        const rows = [];
        dates.forEach((date, i) => {
            if (macdResult.macdLine[i] != null) rows.push({ date, value: macdResult.macdLine[i], series: 'MACD' });
            if (macdResult.signalLine[i] != null)
                rows.push({ date, value: macdResult.signalLine[i], series: 'Signal' });
        });
        return rows;
    }, [dates, macdResult]);

    const macdHistogramData = useMemo(
        () =>
            dates
                .map((date, i) => ({
                    date,
                    value: macdResult.histogram[i],
                    trend: macdResult.histogram[i] >= 0 ? 'Bullish' : 'Bearish',
                }))
                .filter((row) => row.value != null),
        [dates, macdResult],
    );

    const adxChartData = useMemo(() => {
        const rows = [];
        dates.forEach((date, i) => {
            if (adxResult.adx[i] != null) rows.push({ date, value: adxResult.adx[i], series: 'ADX' });
            if (adxResult.plusDI[i] != null) rows.push({ date, value: adxResult.plusDI[i], series: '+DI' });
            if (adxResult.minusDI[i] != null) rows.push({ date, value: adxResult.minusDI[i], series: '-DI' });
        });
        return rows;
    }, [dates, adxResult]);

    // Sur les longues périodes (90D+), CoinGecko réduit fortement la granularité des bougies (jusqu'à 1 point / 4 jours),
    // ce qui peut laisser trop peu de points pour calculer certains indicateurs : on l'affiche clairement plutôt que de montrer un graphique vide.
    const hasRsiData = rsi14.some((v) => v != null);
    const hasMacdData = macdLineData.length > 0;
    const hasAdxData = adxChartData.length > 0;
    const insufficientDataMessage =
        'Not enough candles for this period to compute this indicator (CoinGecko reduces candle granularity on long ranges). Try a shorter range.';

    const priceChange24h = Number(currentInfo?.priceChange24h) || 0;
    const upTrend = priceChange24h >= 0;

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/app/market')}>
                    Back to market
                </Button>
            </Space>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 16,
                }}
            >
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        {cryptoLabel(cryptoId)}
                    </Title>
                    {currentInfo && (
                        <Space size="middle" style={{ marginTop: 4 }}>
                            <Text strong style={{ fontSize: 20 }}>
                                {formatPrice(currentInfo.currentPrice)}
                            </Text>
                            <Tag color={upTrend ? 'green' : 'red'}>
                                {upTrend ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{' '}
                                {priceChange24h.toFixed(2)} % (24h)
                            </Tag>
                            <Text type="secondary">
                                Market cap {formatCompact(currentInfo.marketCap)}
                            </Text>
                        </Space>
                    )}
                </div>
                <Button
                    type="primary"
                    icon={<SwapOutlined />}
                    onClick={() => navigate(`/app/trading?crypto=${cryptoId}`)}
                >
                    Trade
                </Button>
            </div>

            {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}

            <Card style={{ marginBottom: 16 }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                        marginBottom: 16,
                    }}
                >
                    <Segmented options={RANGE_OPTIONS} value={days} onChange={setDays} />
                    <Checkbox.Group
                        options={INDICATOR_OPTIONS}
                        value={activeIndicators}
                        onChange={setActiveIndicators}
                    />
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <Spin size="large" />
                    </div>
                ) : ohlc.length === 0 ? (
                    <Alert type="warning" showIcon message="No historical data available for this asset." />
                ) : (
                    <Line
                        data={priceChartData}
                        xField="date"
                        yField="value"
                        colorField="series"
                        height={CHART_HEIGHT}
                        axis={axisConfig}
                        legend={{ color: { position: 'top' } }}
                        tooltip={{ channel: 'y', valueFormatter: (v) => formatPrice(v) }}
                    />
                )}
                <div style={{ marginTop: 12, color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>
                    Price history provided by CoinGecko ({days} day{days > 1 ? 's' : ''}).
                </div>
            </Card>

            {!loading && ohlc.length > 0 && showRSI && (
                <Card title="RSI — Relative Strength Index (14)" style={{ marginBottom: 16 }}>
                    {hasRsiData ? (
                        <Line
                            data={rsiChartData}
                            xField="date"
                            yField="value"
                            colorField="series"
                            height={SUB_CHART_HEIGHT}
                            axis={axisConfig}
                            legend={{ color: { position: 'top' } }}
                        />
                    ) : (
                        <Alert type="info" showIcon message={insufficientDataMessage} />
                    )}
                </Card>
            )}

            {!loading && ohlc.length > 0 && showMACD && (
                <Card title="MACD (12, 26, 9)" style={{ marginBottom: 16 }}>
                    {hasMacdData ? (
                        <>
                            <Line
                                data={macdLineData}
                                xField="date"
                                yField="value"
                                colorField="series"
                                height={SUB_CHART_HEIGHT}
                                axis={axisConfig}
                                legend={{ color: { position: 'top' } }}
                            />
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Histogram (MACD − Signal)
                                </Text>
                                <Column
                                    data={macdHistogramData}
                                    xField="date"
                                    yField="value"
                                    colorField="trend"
                                    height={140}
                                    axis={axisConfig}
                                    legend={false}
                                />
                            </div>
                        </>
                    ) : (
                        <Alert type="info" showIcon message={insufficientDataMessage} />
                    )}
                </Card>
            )}

            {!loading && ohlc.length > 0 && showADX && (
                <Card title="ADX — Average Directional Index (14)" style={{ marginBottom: 16 }}>
                    {hasAdxData ? (
                        <Line
                            data={adxChartData}
                            xField="date"
                            yField="value"
                            colorField="series"
                            height={SUB_CHART_HEIGHT}
                            axis={axisConfig}
                            legend={{ color: { position: 'top' } }}
                        />
                    ) : (
                        <Alert type="info" showIcon message={insufficientDataMessage} />
                    )}
                </Card>
            )}
        </div>
    );
}
