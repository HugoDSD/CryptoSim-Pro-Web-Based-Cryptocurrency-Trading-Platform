import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Button, Alert, Typography, Space, Switch } from 'antd';
import {
    ReloadOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    SwapOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { formatPrice, formatCompact, cryptoLabel, CRYPTOS } from '../utils/format';
const { Title } = Typography;
export default function Market() {
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [auto, setAuto] = useState(false);
    const load = useCallback(async () => {
        setError('');
        try {
            const data = await apiService.getMarketPrices();
            setRows(data || []);
        } catch (err) {
            setError(err.message || 'Unable to load the market.');
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    useEffect(() => {
        if (!auto) return;
        const id = setInterval(load, 30000);
        return () => clearInterval(id);
    }, [auto, load]);
    const columns = [
        {
            title: 'Asset',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <strong>{cryptoLabel(id)}</strong>,
            sorter: (a, b) => cryptoLabel(a.id).localeCompare(cryptoLabel(b.id)),
        },
        {
            title: 'Price',
            dataIndex: 'currentPrice',
            key: 'currentPrice',
            align: 'right',
            render: (p) => formatPrice(p),
            sorter: (a, b) => a.currentPrice - b.currentPrice,
        },
        {
            title: '24h change',
            dataIndex: 'priceChange24h',
            key: 'priceChange24h',
            align: 'right',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.priceChange24h - b.priceChange24h,
            render: (chg) => {
                const up = Number(chg) >= 0;
                return (
                    <Tag color={up ? 'green' : 'red'}>
                        {up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Number(chg).toFixed(2)}{' '}
                        %
                    </Tag>
                );
            },
        },
        {
            title: 'Market cap',
            dataIndex: 'marketCap',
            key: 'marketCap',
            align: 'right',
            render: (v) => formatCompact(v),
            sorter: (a, b) => a.marketCap - b.marketCap,
        },
        {
            title: '24h volume',
            dataIndex: 'volume24h',
            key: 'volume24h',
            align: 'right',
            render: (v) => formatCompact(v),
            sorter: (a, b) => a.volume24h - b.volume24h,
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, row) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<SwapOutlined />}
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/app/trading?crypto=${row.id}`);
                    }}
                >
                    Trade
                </Button>
            ),
        },
    ];
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
                    Market
                </Title>
                <Space>
                    <span>Auto 30s</span>
                    <Switch checked={auto} onChange={setAuto} />
                    <Button icon={<ReloadOutlined />} onClick={load}>
                        Refresh
                    </Button>
                </Space>
            </div>

            {error && (
                <Alert
                    type="error"
                    showIcon
                    message={error}
                    style={{
                        marginBottom: 16,
                    }}
                />
            )}

            <Card>
                <Table
                    rowKey="id"
                    loading={loading}
                    columns={columns}
                    dataSource={rows}
                    pagination={false}
                    scroll={{
                        x: 'max-content',
                    }}
                    onRow={(row) => ({
                        onClick: () => navigate(`/app/market/${row.id}`),
                        style: { cursor: 'pointer' },
                    })}
                />
                <div
                    style={{
                        marginTop: 12,
                        color: 'rgba(0,0,0,0.45)',
                        fontSize: 12,
                    }}
                >
                    {rows.length} cryptocurrencies · prices provided by CoinGecko (refreshed every
                    30s on the server).
                    {rows.length === 0 && !loading && ` (${CRYPTOS.length} expected)`}
                </div>
            </Card>
        </div>
    );
}
