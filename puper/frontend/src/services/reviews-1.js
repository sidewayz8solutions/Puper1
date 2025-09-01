import { supabase } from './supabase';

export const getReviews = async (restroomId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        users (
          id,
          username,
          display_name
        )
      `)
      .eq('restroom_id', restroomId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const submitReview = async (restroomId, reviewData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('You must be logged in to submit a review');
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        restroom_id: restroomId,
        user_id: user.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        users (
          id,
          username,
          display_name
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

export const updateReview = async (reviewId, reviewData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('You must be logged in to update a review');
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating: reviewData.rating,
        comment: reviewData.comment,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .eq('user_id', user.id) // Ensure user can only update their own reviews
      .select(`
        *,
        users (
          id,
          username,
          display_name
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('You must be logged in to delete a review');
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id); // Ensure user can only delete their own reviews

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const markHelpful = async (reviewId) => {
  const response = await api.post(`/reviews/${reviewId}/helpful`);
  return response.data;
};
