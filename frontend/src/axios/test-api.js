import { mount } from '@vue/test-utils'
import Login from '@/components/Login.vue'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

describe('Login Portal', () => {
  let mock

  beforeEach(() => {
    mock = new MockAdapter(axios)
  })

  afterEach(() => {
    mock.reset()
  })

  it('logs in successfully with correct credentials', async () => {
    // Mock backend response
    mock.onPost('/api/login').reply(200, {
      token: 'fake-jwt-token',
      user: { id: 1, name: 'Evelyn' }
    })

    const wrapper = mount(Login)

    // Fill in form
    await wrapper.find('input[name="email"]').setValue('test@example.com')
    await wrapper.find('input[name="password"]').setValue('password123')

    // Trigger submit
    await wrapper.find('form').trigger('submit.prevent')

    // Assert: check if token or user state updated
    expect(wrapper.emitted()).toHaveProperty('login-success')
  })
})
