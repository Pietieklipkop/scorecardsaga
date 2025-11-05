
'use client';

import { FC } from 'react';

const Navbar: FC = () => {
  return (
    <div className='navbar bg-base-100'>
      <div className='flex-1'>
        <a className='btn btn-ghost text-xl'>Fairtree</a>
      </div>
      <div className='flex-none'>
        <ul className='menu menu-horizontal px-1'>
          <li>
            <a>About us</a>
          </li>
          <li>
            <a>Funds</a>
          </li>
          <li>
            <a>Capabilities</a>
          </li>
          <li>
            <a>Resource Hub</a>
          </li>
        </ul>
        <button className='btn btn-primary'>Invest Now</button>
      </div>
    </div>
  );
};

const Hero: FC = () => {
  return (
    <div className='hero min-h-screen bg-base-200'>
      <div className='hero-content text-center'>
        <div className='max-w-md'>
          <h1 className='text-5xl font-bold'>Private Share Portfolio</h1>
          <p className='py-6'>
            High conviction stock selection by Fairtree Portfolio Managers,
            Cornelius Zeeman and Jacques Haasbroek.
          </p>
        </div>
      </div>
    </div>
  );
};

const HowDoesItWork: FC = () => {
  return (
    <section className='py-20'>
      <div className='container mx-auto'>
        <h2 className='text-3xl font-bold text-center mb-12'>
          How does it work?
        </h2>
        <div className='flex flex-col md:flex-row gap-8 items-center'>
          <div className='md:w-1/2'>
            <p className='mb-4'>
              A concentrated portfolio of 25 - 30 high conviction stocks ideas.
              This strategy aims to capture growth opportunities while managing
              the elevated risk that comes with a focused portfolio. The
              portfolio offers diversification across countries, sectors and
              factors (growth, value, quality and momentum).
            </p>
            <p>
              Each holding is classified within a simple &quot;robot&quot; guidance system
              which helps with the handling of new flows :
            </p>
          </div>
          <div className='md:w-1/2'>
            <ul>
              <li className='flex items-center mb-2'>
                <span className='w-4 h-4 rounded-full bg-green-500 mr-4'></span>
                <span>
                  <span className='font-bold'>Green</span> – We would recommend
                  topping up if additional capital becomes available.
                </span>
              </li>
              <li className='flex items-center mb-2'>
                <span className='w-4 h-4 rounded-full bg-orange-500 mr-4'></span>
                <span>
                  <span className='font-bold'>Orange</span> – Maintain your
                  current position if there are small flows, but trade if there
                  is a sizeable change.
                </span>
              </li>
              <li className='flex items-center'>
                <span className='w-4 h-4 rounded-full bg-red-500 mr-4'></span>
                <span>
                  <span className='font-bold'>Red</span> – Consider selling when
                  the right opportunity arises.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

const InvestmentPhilosophy: FC = () => {
  return (
    <section className='py-20 bg-base-200'>
      <div className='container mx-auto'>
        <h2 className='text-3xl font-bold text-center mb-12'>
          Investment Philosophy
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          <div className='card bg-base-100 shadow-xl'>
            <div className='card-body'>
              {/* Icon placeholder */}
              <div className='text-4xl mb-4'>ICON</div>
              <h3 className='card-title'>Focus on cash Flows</h3>
              <p>(not just earnings)</p>
            </div>
          </div>
          <div className='card bg-base-100 shadow-xl'>
            <div className='card-body'>
              {/* Icon placeholder */}
              <div className='text-4xl mb-4'>ICON</div>
              <h3 className='card-title'>Valuation disciplined</h3>
              <p>(no one can predict the future)</p>
            </div>
          </div>
          <div className='card bg-base-100 shadow-xl'>
            <div className='card-body'>
              {/* Icon placeholder */}
              <div className='text-4xl mb-4'>ICON</div>
              <h3 className='card-title'>Thinking in probabilities</h3>
              <p>(no one can predict the future)</p>
            </div>
          </div>
          <div className='card bg-base-100 shadow-xl'>
            <div className='card-body'>
              {/* Icon placeholder */}
              <div className='text-4xl mb-4'>ICON</div>
              <h3 className='card-title'>Style Agnostic</h3>
              <p>(macro aware)</p>
            </div>
          </div>
          <div className='card bg-base-100 shadow-xl'>
            <div className='card-body'>
              {/* Icon placeholder */}
              <div className='text-4xl mb-4'>ICON</div>
              <h3 className='card-title'>Highly diversified</h3>
            </div>
          </div>
          <div className='card bg-base-100 shadow-xl'>
            <div className='card-body'>
              {/* Icon placeholder */}
              <div className='text-4xl mb-4'>ICON</div>
              <h3 className='card-title'>Highly active</h3>
              <p>(adjusted to shift in risk-reward)</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StockList: FC = () => {
  const stocks = [
    {
      company: 'Microsoft',
      ticker: 'MSFT US',
      weight: '5.0%',
      status: 'green',
    },
    { company: 'Kaspi', ticker: 'KSPI US', weight: '4.2%', status: 'green' },
    { company: 'Amazon', ticker: 'AMZN US', weight: '3.5%', status: 'green' },
    {
      company: 'Coca-Cola',
      ticker: 'KO US',
      weight: '3.2%',
      status: 'orange',
    },
    {
      company: 'Berkshire',
      ticker: 'BRKB US',
      weight: '3.1%',
      status: 'green',
    },
    { company: 'Zoetis', ticker: 'ZTS US', weight: '3.1%', status: 'green' },
    { company: 'TBC Bank', ticker: 'TBCG LN', weight: '3.1%', status: 'red' },
    { company: 'Tencent', ticker: '700 HK', weight: '2.9%', status: 'green' },
    { company: 'JD.com', ticker: 'JD US', weight: '2.9%', status: 'green' },
    {
      company: 'Fortinet',
      ticker: 'FTNT US',
      weight: '2.8%',
      status: 'orange',
    },
    { company: 'Exor', ticker: 'EXO NA', weight: '2.9%', status: 'green' },
    {
      company: 'Novo Nordisk',
      ticker: 'NOVOB DC',
      weight: '2.8%',
      status: 'green',
    },
    {
      company: 'Evolution',
      ticker: 'EVO SS',
      weight: '2.8%',
      status: 'green',
    },
    { company: 'Meta', ticker: 'META US', weight: '2.7%', status: 'green' },
  ];

  const statusColors: { [key: string]: string } = {
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <section className='py-20'>
      <div className='container mx-auto'>
        <div className='flex justify-between items-center mb-12'>
          <h2 className='text-3xl font-bold'>Stock list</h2>
          <button className='btn btn-primary'>Download Fund Factsheet</button>
        </div>
        <div className='overflow-x-auto'>
          <table className='table'>
            <thead>
              <tr>
                <th></th>
                <th>Company</th>
                <th>Ticker</th>
                <th>Weight</th>
                <th>Status</th>
                <th>Infosheet</th>
                <th>Watch Equity Explorer</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, index) => (
                <tr key={index}>
                  <th>{index + 1}</th>
                  <td>{stock.company}</td>
                  <td>{stock.ticker}</td>
                  <td>{stock.weight}</td>
                  <td>
                    <div
                      className={`h-4 w-12 rounded-full ${statusColors[stock.status]}`}
                    ></div>
                  </td>
                  <td>
                    <a href='#' className='link'>
                      Download
                    </a>
                  </td>
                  <td>
                    <a href='#' className='link'>
                      Play Icon
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};


export const LandingPage: FC = () => {
    return (
        <>
            <Navbar />
            <main className='container mx-auto px-4 py-8 md:py-12 flex-grow'>
                <Hero />
                <HowDoesItWork />
                <InvestmentPhilosophy />
                <StockList />
            </main>
        </>
    )
}
