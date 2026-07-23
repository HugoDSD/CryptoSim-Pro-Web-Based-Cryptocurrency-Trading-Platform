import React, { useState } from 'react';
import { Layout, Menu, Button, Grid, theme } from 'antd';
import {
    DashboardOutlined,
    LineChartOutlined,
    SwapOutlined,
    WalletOutlined,
    HistoryOutlined,
    TrophyOutlined,
    StarOutlined,
    BellOutlined,
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/apiService';
const { Header, Sider, Content } = Layout;
const NAV_ITEMS = [
    {
        key: '/app',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
    },
    {
        key: '/app/market',
        icon: <LineChartOutlined />,
        label: 'Market',
    },
    {
        key: '/app/trading',
        icon: <SwapOutlined />,
        label: 'Trading',
    },
    {
        key: '/app/portfolio',
        icon: <WalletOutlined />,
        label: 'Portfolio',
    },
    {
        key: '/app/history',
        icon: <HistoryOutlined />,
        label: 'History',
    },
    {
        key: '/app/leaderboard',
        icon: <TrophyOutlined />,
        label: 'Leaderboard',
    },
    {
        key: '/app/watchlist',
        icon: <StarOutlined />,
        label: 'Watchlist',
    },
    {
        key: '/app/alerts',
        icon: <BellOutlined />,
        label: 'Alerts',
    },
    {
        key: '/app/profile',
        icon: <UserOutlined />,
        label: 'Profile',
    },
];
export default function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const screens = Grid.useBreakpoint();
    const [collapsed, setCollapsed] = useState(false);
    const { token } = theme.useToken();
    const handleLogout = () => {
        apiService.logout();
        navigate('/login');
    };
    return (
        <Layout
            style={{
                minHeight: '100vh',
            }}
        >
            <Sider
                breakpoint="lg"
                collapsedWidth={screens.xs ? 0 : 80}
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                theme="dark"
            >
                <div
                    style={{
                        height: 56,
                        margin: 16,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: collapsed ? 16 : 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        letterSpacing: 0.5,
                    }}
                >
                    {collapsed ? '₿' : '₿ CryptoSim'}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={NAV_ITEMS}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        padding: '0 24px',
                        background: token.colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    }}
                >
                    <span
                        style={{
                            fontWeight: 600,
                            fontSize: 16,
                        }}
                    >
                        {NAV_ITEMS.find((i) => i.key === location.pathname)?.label ??
                            'CryptoSim Pro'}
                    </span>
                    <Button icon={<LogoutOutlined />} onClick={handleLogout}>
                        Logout
                    </Button>
                </Header>

                <Content
                    style={{
                        margin: 24,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
