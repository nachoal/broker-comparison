import BrokerSimulator from './BrokerSimulator.js';

function App() {
  return (
    <div className="App bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Simulador de Comparación de Brokers</h1>
        <BrokerSimulator />
      </div>
    </div>
  );
}

export default App;