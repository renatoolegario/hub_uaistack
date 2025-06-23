import React from 'react';

function CodigoPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden md:block w-1/2 relative">
        <img src="/auth-login-background.svg" alt="Background" className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-end p-8">
        <form className="w-full max-w-sm ml-auto">
          <h1 className="text-2xl font-bold mb-4">Login</h1>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1">Email</label>
            <input id="email" type="email" className="w-full border rounded p-2" />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-1">Senha</label>
            <input id="password" type="password" className="w-full border rounded p-2" />
          </div>
          <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded">Entrar</button>
        </form>
      </div>
    </div>
  );
}

export default CodigoPage;
