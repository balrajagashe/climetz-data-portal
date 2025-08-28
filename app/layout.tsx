import './globals.css';
import Header from '../components/Header';


export const metadata = { title: 'Climetz Data Portal', description: 'monitoring simplified' };

export default function RootLayout({ children }:{children:React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="container">{children}</main>
        <footer className="container" style={{opacity:.6,marginTop:32}}>© Climetz — monitoring simplified</footer>
      </body>
    </html>
  );
}
