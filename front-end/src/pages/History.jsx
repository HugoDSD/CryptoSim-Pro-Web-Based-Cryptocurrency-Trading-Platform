import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Button, Alert, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import apiService from '../services/apiService';
import { formatUSD, formatPrice, formatQuantity, cryptoLabel, CRYPTOS } from '../utils/format';
const { Title } = Typography;
export default function History() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const load = useCallback(async () => {
        setError('');
        try {
            setRows((await apiService.getHistory()) || []);
        } catch (err) {
            setError(err.message || 'Unable to load the history.');
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            defaultSortOrder: 'descend',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (d) => new Date(d).toLocaleString('en-US'),
        },
        {
            title: 'Asset',
            dataIndex: 'cryptoId',
            key: 'cryptoId',
            filters: CRYPTOS.map((c) => ({
                text: c.name,
                value: c.id,
            })),
            onFilter: (value, row) => row.cryptoId === value,
            render: (id) => cryptoLabel(id),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            filters: [
                {
                    text: 'Buy',
                    value: 'BUY',
                },
                {
                    text: 'Sell',
                    value: 'SELL',
                },
            ],
            onFilter: (value, row) => row.type === value,
            render: (t) => <Tag color={t === 'BUY' ? 'green' : 'volcano'}>{t}</Tag>,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'right',
            sorter: (a, b) => a.quantity - b.quantity,
            render: (q) => formatQuantity(q),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            align: 'right',
            sorter: (a, b) => a.price - b.price,
            render: (p) => formatPrice(p),
        },
        {
            title: 'Fee',
            dataIndex: 'fee',
            key: 'fee',
            align: 'right',
            render: (f) => formatUSD(f),
        },
        {
            title: 'Total',
            dataIndex: 'totalValue',
            key: 'totalValue',
            align: 'right',
            sorter: (a, b) => a.totalValue - b.totalValue,
            render: (v) => <strong>{formatUSD(v)}</strong>,
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
                    Transaction history
                </Title>
                <Button icon={<ReloadOutlined />} onClick={load}>
                    Refresh
                </Button>
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
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                    }}
                    scroll={{
                        x: 'max-content',
                    }}
                />
            </Card>
        </div>
    );
}
