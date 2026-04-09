// This file redirects to admin login by default
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AdminIndex() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/admin/adminLogin');
  }, []);
  
  return null;
}