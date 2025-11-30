
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChallenge } from '../api/challenges'; // Fictional API function

const CreateChallengeForm = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createChallenge,
    // When mutate is called:
    onMutate: async (newChallenge) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['challenges'] });

      // Snapshot the previous value
      const previousChallenges = queryClient.getQueryData(['challenges']);

      // Optimistically update to the new value
      queryClient.setQueryData(['challenges'], (old) => [...(old || []), { ...newChallenge, id: `temp-${Date.now()}` }]);

      // Return a context object with the snapshotted value
      return { previousChallenges };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newChallenge, context) => {
      queryClient.setQueryData(['challenges'], context.previousChallenges);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newChallenge = Object.fromEntries(formData.entries());
    mutation.mutate(newChallenge);
    e.target.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields for the new challenge */}
      <input name="title" placeholder="Challenge Title" required />
      <textarea name="description" placeholder="Description" required />
      <button type="submit">Create Challenge</button>
    </form>
  );
};

export default CreateChallengeForm;
