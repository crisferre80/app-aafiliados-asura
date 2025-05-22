import React from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import MembershipCard from '../components/MembershipCard';
import type { Affiliate } from '../types/types';

const MembershipCardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [affiliate, setAffiliate] = React.useState<Affiliate | null>(null);
  const [cardNumber, setCardNumber] = React.useState<string>('');
  const [validThrough, setValidThrough] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) throw new Error('No ID provided');

        // Create anonymous client for public access
        const publicClient = supabase.from('membership_cards');

        // Fetch card data
        const { data: cardData, error: cardError } = await publicClient
          .select(`
            *,
            affiliates (
              id,
              name,
              document_id,
              photo_url,
              join_date,
              active
            )
          `)
          .eq('id', id)
          .single();

        if (cardError) throw cardError;
        if (!cardData) throw new Error('Card not found');
        if (!cardData.affiliates) throw new Error('Affiliate not found');

        // Set affiliate data
        setAffiliate(cardData.affiliates as Affiliate);
        setCardNumber(cardData.card_number);
        setValidThrough(cardData.valid_through);
        setLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-t-4 border-b-4 border-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !affiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600">{error || 'Carnet no encontrado'}</p>
        </div>
      </div>
    );
  }

  if (!affiliate.active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-2">Carnet Inactivo</h1>
          <p className="text-gray-600">Este carnet de afiliado ya no está activo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <MembershipCard
        affiliate={affiliate}
        cardNumber={cardNumber}
        validThrough={validThrough}
      />
    </div>
  );
};

export default MembershipCardPage;