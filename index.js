// import faker from 'faker';

(() => {
  const USER_LIMIT = 30;
  const MAX_RATE_FOR_COMPANY = USER_LIMIT * 5;

  // number of companies
  let companies = [
    {
      id: 1,
    },
    {
      id: 2,
    },
    {
      id: 3,
    },
    {
      id: 4,
    },
    {
      id: 5,
    },
  ];

  // func that generates a user
  const createUser = id => {
    return {
      id,
      user_choosed_by: [
        ...companies
          .map(item => item.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 4)
          .sort(),
      ],
      setUserChoises: function() {
        const filteredCompanies = companies.filter(
          item => !this.user_choosed_by.includes(item.id)
        );
        this.user_choises = [
          ...this.user_choosed_by,
          this.user_choosed_by.length !== companies.length &&
            filteredCompanies.length > 0 &&
            filteredCompanies[
              Math.floor(Math.random() * filteredCompanies.length)
            ].id,
        ]
          .filter(item => item !== null)
          .sort();
        delete this.setUserChoises;
        return this;
      },
      setUserRates: function() {
        this.user_rated_by = this.user_choosed_by.map((item, id) => {
          return {
            id,
            company_id: item,
            rate: Math.floor(Math.random() * 5 + 1),
          };
        });
        delete this.setUserRates;
        return this;
      },
    }
      .setUserChoises()
      .setUserRates();
  };

  // generate the users

  let i = 0;
  let numbers = [];
  while (i < 100) {
    numbers.push(i);
    i++;
  }
  users = numbers.map(item => createUser(item));

  // generate companies based on users
  let newCompanies = companies.map(company => {
    return {
      id: company.id,
      users: [],
      setUsersChoosed: function() {
        this.users_chosen = users
          .map(
            user =>
              user.user_choosed_by.includes(this.id) && {
                ...user,
                rate_given: user.user_rated_by.find(
                  item => item.company_id === this.id
                ),
              }
          )
          .filter(item => item != false)
          .sort();
        delete this.setUsersChoosed;
        return this;
      },
    }.setUsersChoosed();
  });

  users.forEach(user => {
    const { user_choosed_by, user_rated_by } = user;
    const companies = [...user_choosed_by.map(item => newCompanies[item - 1])];

    // calculez scorul companiilor care au ales acest user
    // scor = rate_user * nr_useri
    const companiesScores = companies.map(company => {
      let {
        users = [{ user_rated_by: { company_id: company.id, rate: 3 } }],
      } = company;

      return {
        ...company,
        score:
          users.length > 0
            ? users.reduce((acc, val) => {
                return (
                  acc +
                  val.user_rated_by.find(item => item.company_id === company.id)
                    .rate
                );
              }, 0)
            : 0,
      };
    });

    // cel mai mic scor si cea mai mare nota

    let minScore = 99999;
    let minScoreCompany = 0;
    // caut companie cu cel mai mic scor
    companiesScores.forEach(company => {
      if (company.score < minScore) {
        minScore = company.score;
        minScoreCompany = company.id;
      }
    });
    let highestRate = 0;
    let highestRateCompany = 0;
    // caut compania de la care a primit cea mai mare nota
    user_rated_by.forEach(user => {
      if (user.rate >= highestRate) {
        highestRate = user.rate;
        highestRateCompany = user.company_id;
      }
    });

    // media scor companii pt if 2
    const companiesScoresMedie =
      companiesScores.reduce((acc, val) => acc + val.score, 0) /
      companiesScores.length;

    // daca compania cu cei mai putin useri e in acelasi timp si compania care i-a dat cea mai mare nota
    if (minScoreCompany === highestRateCompany) {
      // punem user-ul in aceasta companie
      newCompanies
        .find(company => company.id === highestRateCompany)
        .users.push(user);
    } else {
      // daca nu incerc sa-i gasesc o firma care are scorul mai mic decat scorul mediu al companiilor
      const filteredCompanies = companiesScores.filter(
        company => company.score < companiesScoresMedie
      );

      if (filteredCompanies.length > 0) {
        // iau compania care ia dat cel mai bun rate
        if (filteredCompanies.length === 1) {
          // daca e doar una e evident in care va fi userul
          newCompanies
            .find(company => company.id === filteredCompanies[0].id)
            .users.push(user);
        } else {
          // daca nu verific daca compania care i-a dat cel mai bun rate are si cei mai putin useri
          let bestRate = 0;
          let bestRateCompany = 0;
          const filtered_user_rated_by = user_rated_by
            .filter(item => {
              for (let i = 0; i < filteredCompanies.length; i++) {
                if (filteredCompanies[i].id === item.company_id) {
                  return true;
                }
              }
              return false;
            })
            .forEach(item => {
              if (item.rate >= bestRate) {
                bestRate = item.rate;
                bestRateCompany = item.company_id;
              }
            });
          newCompanies
            .find(company => company.id === bestRateCompany)
            .users.push(user);
        }
      } else {
        // verific daca compania cu cei mai putin useri are si cel mai mic scor
        // daca nu punem userul in compania care are cei mai putini useri

        // TODO: transform this shit in a function
        let minUserCount = 9999999;
        let minUserCountCompanyId = 0;
        companies.forEach(company => {
          const { users = [] } = company;

          if (users.length <= minUserCount) {
            minUserCount = user.length;
            minUserCountCompanyId = company.id;
          }
        });

        let minCompanyScore = 9999999;
        let minCompanyScoreId = 0;

        companiesScores.forEach(company => {
          if (company.score <= minCompanyScore) {
            minCompanyScore = company.score;
            minCompanyScoreId = company.id;
          }
        });

        // daca compania cu cei mai putin useri are si cel mai mic scor
        if (minCompanyScoreId === minUserCountCompanyId) {
          newCompanies
            .find(company => company.id === minCompanyScoreId)
            .users.push(user);
        } else {
          newCompanies
            .find(company => company.id === minUserCountCompanyId)
            .users.push(user);
        }
      }
    }
  });

  console.log(users, newCompanies);

  // just some efficiency testing
  // medie rate useri
  console.log(
    newCompanies.map(company => {
      const { users, id } = company;
      let medie =
        users.reduce((acc, val) => {
          return (
            acc + val.user_rated_by.find(item => item.company_id === id).rate
          );
        }, 0) / users.length;
      return medie;
    })
  );
})();
