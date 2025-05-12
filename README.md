
![Logo](https://i.ibb.co/cS7SV1Sk/Kopie-von-Cash-Mate.png)


# PortNote

Stop juggling spreadsheets and guessing which service uses which port — PortNote gives you a clear, organized view of your entire port landscape. Add your servers and VMs via a sleek web interface, assign and document port usage across all systems, and avoid conflicts before they happen. Built by the developer of [CoreControl](https://github.com/crocofied/corecontrol), PortNote brings structure, clarity, and control to one of the most overlooked parts of your infrastructure.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/corecontrol)
[![Sponsor](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#white)](https://github.com/sponsors/crocofied)


## Screenshots
Login Page:
![Login Page](/screenshots/login.png)

Dashboard:
![Dashboard](/screenshots/dashboard.png)

Create:
![Create](/screenshots/create.png)

Random Port Generator
![Portgen](/screenshots/portgen.png)

## Deployment

Simply run this compose.yml:
```yml
services:
  web:
    image: haedlessdev/portnote:latest
    ports:
      - "3000:3000"
    environment:
      JWT_SECRET: RANDOM_SECRET # Replace with a secure random string
      USER_SECRET: RANDOM_SECRET # Replace with a secure random string
      LOGIN_USERNAME: username # Replace with a username
      LOGIN_PASSWORD: mypassword # Replace with a custom password
      DATABASE_URL: "postgresql://postgres:postgres@db:5432/postgres"
    depends_on:
      db:
        condition: service_started

  agent:
    image: haedlessdev/portnote-agent:latest
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@db:5432/postgres"
    depends_on:
      db:
        condition: service_started

  db:
    image: postgres:17
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Tech Stack & Credits

The application is build with:
- Next.js & Typescript
- Tailwindcss with [daisyui](https://daisyui.com/)
- PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- Icons by [Lucide](https://lucide.dev/)
- and a lot of love ❤️

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=crocofied/PortNote&type=Date)](https://www.star-history.com/#crocofied/PortNote&Date)

## License

Licensed under the [MIT License](https://github.com/crocofied/PortNote/blob/main/LICENSE).
