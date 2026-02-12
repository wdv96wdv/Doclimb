import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Join from './Join';

// Mock the AuthContext
const mockSignUp = vi.fn();

vi.mock('../../context/AuthContext', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useAuth: () => ({
      signUp: mockSignUp,
    }),
  };
});

describe('Join Component', () => {
  it('should not have a profile ID input field', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Join />
        </AuthProvider>
      </BrowserRouter>
    );

    const profileIdInput = screen.queryByLabelText(/프로필 아이디/i);
    expect(profileIdInput).not.toBeInTheDocument();
  });

  it('should submit the form without a nickname', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Join />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/이메일/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/비밀번호/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/^이름/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/닉네임/i), { target: { value: 'testuser' } });

    fireEvent.click(screen.getByRole('button', { name: /회원가입/i }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(mockSignUp).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
      expect.not.objectContaining({
        nickname: expect.any(String),
      })
    );
  });
});
