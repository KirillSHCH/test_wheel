import * as mysql from 'mysql2/promise';
import { dbOptions, ICustomer, IManager, RolesEnum } from './index';
import { createObjectCsvWriter } from 'csv-writer';

const CLIENT_LIMIT = 3000;

async function main() {
  const connection: mysql.Connection = await mysql.createConnection(dbOptions);

  console.log('Успешно подключились к БД');

  const customers: ICustomer[] = await getCustomersWithoutManagers(connection);
  console.log('Результат:', customers);

  const [attractingMs, personalMs] = await getManagers(connection);

  console.log('Менеджеры по привлечению: ', attractingMs);
  console.log('Персональные менеджеры: ', personalMs);

  await connection.end();
  console.log('Подключение к БД остановлено');

  // НЭ УСПЭЛ
  const personalData = attachCustomersToManagers({ customers, attractingMs, personalMs });

  await writeReports({ attractingData: attractingMs, personalData });
}

function attachCustomersToManagers({ customers, attractingMs, personalMs }: {
  customers: ICustomer[],
  attractingMs: IManager[],
  personalMs: IManager[]
}) {
  const result: ICustomer[] = [];

  for (const [index, customer] of customers.entries()) {
    // НЭ УСПЭЛ
  }
}

async function getManagers(connection: mysql.Connection) {
  const [rows] = await connection.execute(
    'select * ' +
    'from managers ' +
    `where role in ('${RolesEnum.attracting}', '${RolesEnum.personal}')`,
  );

  const managers = rows as IManager[];

  return [
    managers.filter((item) => item.role === RolesEnum.attracting),
    managers.filter((item) => item.role === RolesEnum.personal),
  ];
}

async function getCustomersWithoutManagers(connection: mysql.Connection): Promise<ICustomer[]> {
  const [rows, fields] = await connection.execute(
    'select c.id, c.city_id, c.first_order_date, c.last_order_date ' +
    'from customers c ' +
    'left join customer_to_manager_assign cma ' +
    'on (c.id = cma.customer_id and c.city_id = cma.city_id) ' +
    'group by c.id, c.city_id ' +
    'having count(cma.manager_id) = 0',
  );

  return rows as ICustomer[];
}

async function writeReports({ attractingData, personalData }: { attractingData: any, personalData: any }) {
  await writeAttractionReport(attractingData);
  await writePersonalReport(personalData);
}

async function writeAttractionReport(managers: {
  fio: string,
  count_before: number,
  count_first: number,
  count_after: number
}[]) {
  const csvWriter = createObjectCsvWriter({
    path: 'output/attraction.csv',
    header: [
      { id: 'fio', title: 'ФИО Менеджера' },
      { id: 'count_before', title: 'Кол-во клиентов до распределения' },
      { id: 'count_first', title: 'Кол-во клиентов, которых довел до 1-го заказа' },
      { id: 'count_after', title: 'Кол-во клиентов после распределения' },
    ],
  });

  await csvWriter.writeRecords(managers);

  return true;
}

async function writePersonalReport(managers: any) {
  const csvWriter = createObjectCsvWriter({
    path: 'output/personal.csv',
    header: [
      { id: 'fio', title: 'ФИО Менеджера' },
      { id: 'count_before', title: 'Кол-во клиентов до распределения' },
      { id: 'count_after', title: 'Кол-во клиентов после распределения' },
      { id: 'count_increase', title: 'Прирост клиентов (в шт.)' },
    ],
  });

  await csvWriter.writeRecords(managers);

  return true;
}


main().catch((e: unknown) => {
  console.log('Произошла ошибка при выполнении скрипта');
  console.log(e);

  process.exit(1);
});