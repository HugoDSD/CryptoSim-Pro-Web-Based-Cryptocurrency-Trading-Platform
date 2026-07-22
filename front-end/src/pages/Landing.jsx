import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Col, Row, Typography, Space, Table, Tag, Alert } from 'antd';
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    ThunderboltOutlined,
    LineChartOutlined,
    SafetyOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import apiService from '../services/apiService';
import { formatPrice, cryptoLabel } from '../utils/format';

const { Title, Paragraph, Text } = Typography;

const FEATURES = [
    {
        icon: <LineChartOutlined style={{ fontSize: 28, color: '#13c2a2' }} />,
        title: 'Live market data',
        description: 'Track real-time crypto prices and trends powered by CoinGecko.',
    },
    {
        icon: <ThunderboltOutlined style={{ fontSize: 28, color: '#13c2a2' }} />,
        title: 'Instant simulated trading',
        description: 'Buy and sell with virtual funds and see your portfolio update instantly.',
    },
    {
        icon: <TrophyOutlined style={{ fontSize: 28, color: '#13c2a2' }} />,
        title: 'Leaderboard',
        description: 'Compare your performance against other investors on the platform.',
    },
    {
        icon: <SafetyOutlined style={{ fontSize: 28, color: '#13c2a2' }} />,
        title: 'Risk-free practice',
        description: 'Learn trading strategies without risking real money.',
    },
];

export default function Landing() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setError('');
        try {
            const data = await apiService.getMarketPrices();
            setRows((data || []).slice(0, 5));
        } catch (err) {
            setError(err.message || 'Unable to load market prices.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const columns = [
        {
            title: 'Asset',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <strong>{cryptoLabel(id)}</strong>,
        },
        {
            title: 'Price',
            dataIndex: 'currentPrice',
            key: 'currentPrice',
            align: 'right',
            render: (p) => formatPrice(p),
        },
        {
            title: '24h change',
            dataIndex: 'priceChange24h',
            key: 'priceChange24h',
            align: 'right',
            render: (chg) => {
                const up = Number(chg) >= 0;
                return (
                    <Tag color={up ? 'green' : 'red'}>
                        {up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Number(chg).toFixed(2)} %
                    </Tag>
                );
            },
        },
    ];

    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 48px',
                }}
            >
                <Title level={3} style={{ margin: 0, color: '#13c2a2' }}>
                    CryptoSim Pro
                </Title>
                <Space>
                    <Button onClick={() => navigate('/login')}>Log in</Button>
                    <Button type="primary" onClick={() => navigate('/login')}>
                        Get started
                    </Button>
                </Space>
            </div>

            <div
                style={{
                    textAlign: 'center',
                    padding: '64px 24px 48px',
                }}
            >
                <Title level={1} style={{ marginBottom: 8 }}>
                    Master crypto trading, risk-free
                </Title>
                <Paragraph
                    type="secondary"
                    style={{
                        fontSize: 16,
                        maxWidth: 600,
                        margin: '0 auto 24px',
                    }}
                >
                    CryptoSim Pro lets you practice cryptocurrency trading with real-time market
                    data and virtual funds. Build your strategy, track your portfolio, and climb
                    the leaderboard.
                </Paragraph>
                <Space>
                    <Button type="primary" size="large" onClick={() => navigate('/login')}>
                        Create a free account
                    </Button>
                </Space>
            </div>

            <div style={{ padding: '0 24px 48px', maxWidth: 1200, margin: '0 auto' }}>
                <Row gutter={[16, 16]}>
                    {FEATURES.map((f) => (
                        <Col xs={24} sm={12} lg={6} key={f.title}>
                            <Card style={{ height: '100%', textAlign: 'center' }}>
                                <Space direction="vertical" size={8}>
                                    {f.icon}
                                    <Text strong>{f.title}</Text>
                                    <Text type="secondary">{f.description}</Text>
                                </Space>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            <div style={{ padding: '0 24px 64px', maxWidth: 800, margin: '0 auto' }}>
                <Title level={4} style={{ textAlign: 'center', marginBottom: 16 }}>
                    Live market snapshot
                </Title>

                {error && (
                    <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />
                )}

                <Card>
                    <Table
                        rowKey="id"
                        loading={loading}
                        columns={columns}
                        dataSource={rows}
                        pagination={false}
                    />
                </Card>
            </div>
        </div>
    );
}
