// components/Dashboard.tsx

import ProductCatalog from "@/components/catalog/ProductCatalog";
import CustomerList from "@/components/lists/CustomerList";
import Footer from "./layout/Footer";
import Header from "./layout/Header";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto p-8">
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <CustomerList />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ProductCatalog />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
