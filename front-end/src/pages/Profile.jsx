import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Card, Input, Button, Typography, Space, Alert, App } from 'antd';
import { SaveOutlined, LockOutlined } from '@ant-design/icons';
import apiService from '../services/apiService';
const { Title, Text } = Typography;
export default function Profile() {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: '',
        surname: '',
        email: '',
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
    });
    const loadProfile = useCallback(async () => {
        setError('');
        try {
            const data = await apiService.getProfile();
            setProfileForm({
                name: data?.name || '',
                surname: data?.surname || '',
                email: data?.email || '',
            });
        } catch (err) {
            setError(err.message || 'Unable to load profile.');
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        loadProfile();
    }, [loadProfile]);
    const saveProfile = async () => {
        if (!profileForm.name.trim() || !profileForm.surname.trim() || !profileForm.email.trim()) {
            message.warning('Please fill in all fields.');
            return;
        }
        setSaving(true);
        try {
            await apiService.updateProfile(profileForm.name, profileForm.surname, profileForm.email);
            message.success('Profile updated.');
        } catch (err) {
            message.error(err.message || 'Unable to update the profile.');
        } finally {
            setSaving(false);
        }
    };
    const changePassword = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            message.warning('Please fill in both password fields.');
            return;
        }
        setChangingPassword(true);
        try {
            await apiService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            message.success('Password changed.');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
            });
        } catch (err) {
            message.error(err.message || 'Unable to change the password.');
        } finally {
            setChangingPassword(false);
        }
    };
    return (
        <div>
            <Title
                level={3}
                style={{
                    marginTop: 0,
                    marginBottom: 16,
                }}
            >
                My profile
            </Title>

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

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Personal information" loading={loading}>
                        <Space
                            direction="vertical"
                            style={{
                                width: '100%',
                            }}
                            size={12}
                        >
                            <div>
                                <Text type="secondary">First name</Text>
                                <Input
                                    style={{
                                        marginTop: 4,
                                    }}
                                    value={profileForm.name}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Text type="secondary">Last name</Text>
                                <Input
                                    style={{
                                        marginTop: 4,
                                    }}
                                    value={profileForm.surname}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            surname: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Text type="secondary">Email</Text>
                                <Input
                                    style={{
                                        marginTop: 4,
                                    }}
                                    type="email"
                                    value={profileForm.email}
                                    onChange={(e) =>
                                        setProfileForm({
                                            ...profileForm,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                loading={saving}
                                onClick={saveProfile}
                                style={{
                                    marginTop: 4,
                                }}
                            >
                                Save changes
                            </Button>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card title="Change password">
                        <Space
                            direction="vertical"
                            style={{
                                width: '100%',
                            }}
                            size={12}
                        >
                            <div>
                                <Text type="secondary">Current password</Text>
                                <Input.Password
                                    style={{
                                        marginTop: 4,
                                    }}
                                    value={passwordForm.currentPassword}
                                    onChange={(e) =>
                                        setPasswordForm({
                                            ...passwordForm,
                                            currentPassword: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <Text type="secondary">New password</Text>
                                <Input.Password
                                    style={{
                                        marginTop: 4,
                                    }}
                                    value={passwordForm.newPassword}
                                    onChange={(e) =>
                                        setPasswordForm({
                                            ...passwordForm,
                                            newPassword: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <Button
                                icon={<LockOutlined />}
                                loading={changingPassword}
                                onClick={changePassword}
                                style={{
                                    marginTop: 4,
                                }}
                            >
                                Update password
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
