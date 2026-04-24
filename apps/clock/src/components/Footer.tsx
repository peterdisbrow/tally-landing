const Footer = () => {
  return (
    <footer className="border-t border-border py-10 bg-secondary">
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-display text-lg font-bold tracking-[0.25em] text-foreground">
            DISBROW
          </span>
          <span className="font-display text-[10px] tracking-[0.35em] text-primary">
            PRODUCTIONS
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="https://atemschool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-xs tracking-wider text-muted-foreground hover:text-primary transition-colors uppercase">

            ATEM School
          </a>
          <a
            href="https://tally.atemschool.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-xs tracking-wider text-muted-foreground hover:text-primary transition-colors uppercase">

            Tally App
          </a>
          







          <a
            href="/clock"
            className="font-display text-xs tracking-wider text-muted-foreground hover:text-primary transition-colors uppercase">

            Production Clock
          </a>
        </div>
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} Disbrow Productions. All rights reserved.
        </p>
      </div>
    </footer>);

};

export default Footer;