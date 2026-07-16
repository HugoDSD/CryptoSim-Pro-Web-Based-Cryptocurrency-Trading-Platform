import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Button, Alert, Typography, Space, Select, Popconfirm, App } from 'antd';
import {
    ReloadOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    PlusOutlined,
    DeleteOutlined,
    SwapOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { formatPrice, formatCompact, cryptoLabel, CRYPTOS } from '../utils/format';
const { Title } = Typography;
export default function Watchlist() {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toAdd, setToAdd] = useState(null);
    const [adding, setAdding] = useState(false);
    const load = useCallback(async () => {
        setError('');
        try {
            setRows((await apiService.getWatchlist()) || []);
        } catch (err) {
            setError(err.message || 'Unable to load the watchlist.');
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    const add = async () => {
        if (!toAdd) return;
        setAdding(true);
        try {
            await apiService.addToWatchlist(toAdd);
            message.success(`${cryptoLabel(toAdd)} added to your watchlist.`);
            setToAdd(null);
            await load();
        } catch (err) {
            message.error(err.message || 'Unable to add this crypto.');
        } finally {
            setAdding(false);
        }
    };
    const remove = async (cryptoId) => {
        try {
            await apiService.removeFromWatchlist(cryptoId);
            message.success(`${cryptoLabel(cryptoId)} removed from your watchlist.`);
            await load();
        } catch (err) {
            message.error(err.message || 'Unable to remove this crypto.');
        }
    };
    const available = CRYPTOS.filter((c) => !rows.some((r) => r.id === c.id));
    const columns = [
        {
            title: 'Asset',
            dataIndex: 'id',
            render: (id) => <strong>{cryptoLabel(id)}</strong>,
        },
        {
            title: 'Price',
            dataIndex: 'currentPrice',
            align: 'right',
            render: (p) => formatPrice(p),
        },
        {
            title: '24h change',
            dataIndex: 'priceChange24h',
            align: 'right',
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
            align: 'right',
            render: (v) => formatCompact(v),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, row) => (
                <Space>
                    <Button
                        size="small"
                        icon={<SwapOutlined />}
                        onClick={() => navigate(`/app/trading?crypto=${row.id}`)}
                    >
                        Trade
                    </Button>
                    <Popconfirm
                        title="Remove from watchlist?"
                        onConfirm={() => remove(row.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
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
                    flexWrap: 'wrap',
                    gap: 12,
                }}
            >
                <Title
                    level={3}
                    style={{
                        margin: 0,
                    }}
                >
                    Watchlist
                </Title>
                <Space wrap>
                    <Select
                        placeholder="Add a crypto"
                        style={{
                            width: 200,
                        }}
                        value={toAdd}
                        onChange={setToAdd}
                        options={available.map((c) => ({
                            value: c.id,
                            label: `${c.name} (${c.symbol})`,
                        }))}
                        disabled={!available.length}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={add}
                        loading={adding}
                        disabled={!toAdd}
                    >
                        Add
                    </Button>
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
                    locale={{
                        emptyText: 'Your watchlist is empty. Add a crypto to follow its price.',
                    }}
                />
            </Card>
        </div>
    );
}
