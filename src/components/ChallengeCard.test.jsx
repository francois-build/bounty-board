
import React from 'react';
import { render, screen } from '@testing-library/react';
import ChallengeCard from './ChallengeCard.jsx';

describe('ChallengeCard', () => {
  const challenge = {
    id: '1',
    title: 'Test Challenge',
    description: 'Test Description',
    clientName: 'Secret Client',
    publicAlias: 'Public Alias',
  };

  test('does not render clientName when user is logged out', () => {
    render(<ChallengeCard challenge={challenge} />);
    expect(screen.queryByText('Secret Client')).toBeNull();
    expect(screen.getByText('Public Alias')).toBeInTheDocument();
  });
});
