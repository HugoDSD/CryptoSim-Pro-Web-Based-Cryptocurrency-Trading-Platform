import React, { useEffect, useState, useCallback } from 'react';
import {
    Row,
    Col,
    Card,
    Table,
    Tag,
    Statistic,
    Spin,
    Alert,
    Button,
    Empty,
    Typography,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
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
export default function Portfolio() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const load = useCallback(async () => {
        setError('');
        try {
            setData(await apiService.getDashboard());
        } catch (err) {
            setError(err.message || 'Unable to load the portfolio.');
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    if (loading) {
        return (
            <div
                style={{
                    textAlign: 'center',
                    paddingTop: 120,
                }}
            >
                <Spin size="large" />
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
    const totalInvested = positions.reduce((s, p) => s + Number(p.initialCost), 0);
    const columns = [
        {
            title: 'Asset',
            dataIndex: 'cryptoId',
            render: (id) => <strong>{cryptoLabel(id)}</strong>,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            align: 'right',
            render: (q) => formatQuantity(q),
        },
        {
            title: 'Avg. price',
            dataIndex: 'avgBuyPrice',
            align: 'right',
            render: (p) => formatPrice(p),
        },
        {
            title: 'Current price',
            dataIndex: 'currentPrice',
            align: 'right',
            render: (p) => formatPrice(p),
        },
        {
            title: 'Invested',
            dataIndex: 'initialCost',
            align: 'right',
            render: (v) => formatUSD(v),
        },
        {
            title: 'Current value',
            dataIndex: 'totMarketValue',
            align: 'right',
            render: (v) => formatUSD(v),
        },
        {
            title: 'Unrealized P&L',
            dataIndex: 'pAndL',
            align: 'right',
            render: (pnl, row) => (
                <Tag color={Number(pnl) > 0 ? 'green' : Number(pnl) < 0 ? 'red' : 'default'}>
                    {Number(pnl) >= 0 ? '+' : ''}
                    {formatUSD(pnl)} ({formatPercent(row.pAndLPercentage)})
                </Tag>
            ),
        },
        {
            title: 'Allocation',
            key: 'alloc',
            align: 'right',
            render: (_, row) => {
                const total = Number(data?.totalCryptoValue) || 1;
                return formatPercent((Number(row.totMarketValue) / total) * 100);
            },
        },
    ];
    const pieData = positions
        .map((p) => ({
            name: cryptoLabel(p.cryptoId),
            value: Number(p.totMarketValue),
        }))
        .filter((d) => d.value > 0);
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
                    My portfolio
                </Title>
                <Button icon={<ReloadOutlined />} onClick={load}>
                    Refresh
                </Button>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Total invested"
                            value={totalInvested}
                            precision={2}
                            prefix="$"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Current crypto value"
                            value={Number(data?.totalCryptoValue)}
                            precision={2}
                            prefix="$"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Total unrealized P&L"
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
                    <Card title="Allocation by asset">
                        {pieData.length ? (
                            <Pie {...pieConfig} />
                        ) : (
                            <Empty description="No position" />
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={16}>
                    <Card title="Positions detail">
                        <Table
                            rowKey="cryptoId"
                            columns={columns}
                            dataSource={positions}
                            pagination={false}
                            scroll={{
                                x: 'max-content',
                            }}
                            locale={{
                                emptyText: <Empty description="You don't hold any crypto" />,
                            }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
