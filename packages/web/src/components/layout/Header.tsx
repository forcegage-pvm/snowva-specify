const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Snowva</h1>
        <nav>
          <a href="#" className="px-4">Dashboard</a>
          <a href="#" className="px-4">Customers</a>
          <a href="#" className="px-4">Products</a>
          <a href="#" className="px-4">Invoices</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
