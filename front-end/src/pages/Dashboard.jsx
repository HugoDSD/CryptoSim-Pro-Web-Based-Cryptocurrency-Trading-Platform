import React, { useEffect, useState } from 'react';
import {
    Row,
    Col,
    Card,
    Statistic,
    Table,
    Tag,
    Spin,
    Alert,
    Button,
    Empty,
    Typography,
} from 'antd';
import { ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import apiService from '../services/apiService';
import {
    formatUSD,
    formatPrice,
    formatQuantity,
    formatPercent,
    pnlColor,
    cryptoLabel,
} from '../utils/format';
const { Title } = Typography;
export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const dashboard = await apiService.getDashboard();
            setData(dashboard);
        } catch (err) {
            setError(err.message || 'Unable to load the dashboard.');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, []);
    if (loading) {
        return (
            <div
                style={{
                    textAlign: 'center',
                    paddingTop: 120,
                }}
            >
                <Spin size="large" />
                <div
                    style={{
                        marginTop: 16,
                        color: 'rgba(0,0,0,0.45)',
                    }}
                >
                    Loading dashboard...
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <Alert
                type="error"
                showIcon
                message="Error"
                description={error}
                action={<Button onClick={load}>Retry</Button>}
            />
        );
    }
    const positions = data?.portfolios ?? [];
    const columns = [
        {
            title: 'Asset',
            dataIndex: 'cryptoId',
            key: 'cryptoId',
            render: (id) => <strong>{cryptoLabel(id)}</strong>,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right',
            render: (q) => formatQuantity(q),
        },
        {
            title: 'Avg. buy price',
            dataIndex: 'avgBuyPrice',
            key: 'avgBuyPrice',
            align: 'right',
            render: (p) => formatPrice(p),
        },
        {
            title: 'Current price',
            dataIndex: 'currentPrice',
            key: 'currentPrice',
            align: 'right',
            render: (p) => formatPrice(p),
        },
        {
            title: 'Value',
            dataIndex: 'totMarketValue',
            key: 'totMarketValue',
            align: 'right',
            render: (v) => formatUSD(v),
        },
        {
            title: 'P&L',
            dataIndex: 'pAndL',
            key: 'pAndL',
            align: 'right',
            render: (pnl, row) => (
                <Tag color={Number(pnl) > 0 ? 'green' : Number(pnl) < 0 ? 'red' : 'default'}>
                    {Number(pnl) >= 0 ? '+' : ''}
                    {formatUSD(pnl)} ({formatPercent(row.pAndLPercentage)})
                </Tag>
            ),
        },
    ];
    const pieData = [
        ...positions.map((p) => ({
            name: cryptoLabel(p.cryptoId),
            value: Number(p.totMarketValue),
        })),
        {
            name: 'Available cash',
            value: Number(data?.cashBalance),
        },
    ].filter((d) => d.value > 0);
    const pieConfig = {
        data: pieData,
        angleField: 'value',
        colorField: 'name',
        innerRadius: 0.6,
        height: 300,
        label: false,
        legend: {
            position: 'bottom',
        },
        tooltip: {
            title: 'name',
            items: [
                {
                    field: 'value',
                    valueFormatter: (v) => formatUSD(v),
                },
            ],
        },
    };
    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                }}
            >
                <Title
                    level={3}
                    style={{
                        margin: 0,
                    }}
                >
                    Dashboard
                </Title>
                <Button icon={<ReloadOutlined />} onClick={load}>
                    Refresh
                </Button>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Available cash"
                            value={Number(data?.cashBalance)}
                            precision={2}
                            prefix="$"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Crypto value"
                            value={Number(data?.totalCryptoValue)}
                            precision={2}
                            prefix="$"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total account value"
                            value={Number(data?.netLiquidationValue)}
                            precision={2}
                            prefix="$"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total gain / loss"
                            value={Number(data?.totalPAndL)}
                            precision={2}
                            prefix="$"
                            styles={{
                                content: {
                                    color: pnlColor(data?.totalPAndL),
                                },
                            }}
                            suffix={
                                <span
                                    style={{
                                        fontSize: 14,
                                    }}
                                >
                                    {Number(data?.earningReturn) >= 0 ? (
                                        <ArrowUpOutlined />
                                    ) : (
                                        <ArrowDownOutlined />
                                    )}{' '}
                                    {formatPercent(data?.earningReturn)}
                                </span>
                            }
                        />
                    </Card>
                </Col>
            </Row>

            <Row
                gutter={[16, 16]}
                style={{
                    marginTop: 16,
                }}
            >
                <Col xs={24} lg={8}>
                    <Card title="Portfolio allocation">
                        {pieData.length ? <Pie {...pieConfig} /> : <Empty description="No data" />}
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card title="My positions">
                        <Table
                            rowKey="cryptoId"
                            columns={columns}
                            dataSource={positions}
                            pagination={false}
                            locale={{
                                emptyText: <Empty description="You don't hold any crypto yet" />,
                            }}
                            scroll={{
                                x: 'max-content',
                            }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
