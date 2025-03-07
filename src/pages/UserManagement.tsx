
import React from 'react';
import { UserManagement } from '../components/UserManagement';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';

const UserManagementPage: React.FC = () => {
  return (
    <Layout requireAuth={true}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-8 px-4"
      >
        <UserManagement />
      </motion.div>
    </Layout>
  );
};

export default UserManagementPage;
