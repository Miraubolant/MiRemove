import { useAuthStore } from '../../stores/authStore';

describe('AuthStore', () => {
  it('initializes with null user', () => {
    console.log('🧪 Testing authStore initialization...');
    const { user } = useAuthStore.getState();
    expect(user).toBeNull();
    console.log('✅ AuthStore init test passed');
  });

  it('can set user', () => {
    console.log('🧪 Testing user setting...');
    const testUser = { id: '1', email: 'test@test.com' };
    useAuthStore.getState().setUser(testUser);
    const { user } = useAuthStore.getState();
    expect(user).toEqual(testUser);
    console.log('✅ Set user test passed');
  });

  it('can clear user', () => {
    console.log('🧪 Testing user clearing...');
    useAuthStore.getState().setUser({ id: '1', email: 'test@test.com' });
    useAuthStore.getState().setUser(null);
    const { user } = useAuthStore.getState();
    expect(user).toBeNull();
    console.log('✅ Clear user test passed');
  });
});