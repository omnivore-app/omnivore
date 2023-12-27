import test from 'ava';
import {
  filter,
} from '../../src/filter';
import {
  parse,
} from '../../src/parse';

type Location = {
  city: string,
};

type Person = {
  attributes?: Record<string, string | null>,
  balance?: number,
  email?: string,
  height: number,
  location?: Location,
  membership?: null,
  name: string,
  nick?: string,
  phoneNumber?: string,
  subscribed?: boolean,
  tags?: string[],
};

const persons: readonly Person[] = [
  {
    height: 180,
    name: 'david',
  },
  {
    height: 175,
    name: 'john',
  },
  {
    height: 175,
    location: {
      city: 'London',
    },
    name: 'mike',
  },
  {
    height: 220,
    name: 'robert',
    tags: [
      'member',
    ],
  },
  {
    attributes: {
      member: null,
    },
    balance: 6_364_917,
    email: 'noah@john.com',
    height: 225,
    membership: null,
    name: 'noah',
    nick: 'john',
    phoneNumber: '404-050-2611',
    subscribed: true,
  },
  {
    height: 150,
    name: 'foo bar',
    nick: 'old dog',
  },
  {
    height: 194,
    name: 'fox',
    nick: 'quick fox',
  },
];

const testQuery = test.macro((t, expectedResultNames: string[]) => {
  const matchingPersonNames = filter(parse(t.title), persons).map((person) => {
    return person.name;
  });

  t.deepEqual(matchingPersonNames, expectedResultNames);
});

test('"david"', testQuery, ['david']);

test('name:"da"', testQuery, ['david']);
test('name:"david"', testQuery, ['david']);
test('name:David', testQuery, ['david']);

test('name:D*d', testQuery, ['david']);
test('name:*avid', testQuery, ['david']);
test('name:a*d', testQuery, ['david']);
test('name:/(david)|(john)/', testQuery, ['david', 'john']);
test('name:/(David)|(John)/', testQuery, []);
test('name:/(David)|(John)/i', testQuery, ['david', 'john']);

test.skip('height:[200 TO 300]', testQuery, ['robert', 'noah']);
test.skip('height:[220 TO 300]', testQuery, ['robert', 'noah']);
test.skip('height:{220 TO 300]', testQuery, ['noah']);
test.skip('height:[200 TO 225]', testQuery, ['robert', 'noah']);
test.skip('height:[200 TO 225}', testQuery, ['robert']);
test.skip('height:{220 TO 225}', testQuery, []);

test('NOT David', testQuery, ['john', 'mike', 'robert', 'noah', 'foo bar', 'fox']);
test('-David', testQuery, ['john', 'mike', 'robert', 'noah', 'foo bar', 'fox']);
test('David OR John', testQuery, ['david', 'john', 'noah']);
test('Noah AND John', testQuery, ['noah']);
test('John AND NOT Noah', testQuery, ['john']);
test('David OR NOT John', testQuery, ['david', 'mike', 'robert', 'foo bar', 'fox']);
test('John AND -Noah', testQuery, ['john']);
test('David OR -John', testQuery, ['david', 'mike', 'robert', 'foo bar', 'fox']);

test('name:David OR John', testQuery, ['david', 'john', 'noah']);

test('name:David OR name:John', testQuery, ['david', 'john']);
test('name:"david" OR name:"john"', testQuery, ['david', 'john']);
test('name:"David" OR name:"John"', testQuery, []);

test.skip('height:=175', testQuery, ['john', 'mike']);
test.skip('height:>200', testQuery, ['robert', 'noah']);
test.skip('height:>220', testQuery, ['noah']);
test.skip('height:>=220', testQuery, ['robert', 'noah']);

test.skip('height:=175 AND NOT name:mike', testQuery, ['john']);

test('"member"', testQuery, ['robert']);

test('tags:"member"', testQuery, ['robert']);

test('"London"', testQuery, ['mike']);
test('city:"London"', testQuery, []);
test('location.city:"London"', testQuery, ['mike']);

test('membership:null', testQuery, ['noah']);
test('attributes.member:null', testQuery, ['noah']);

test('subscribed:true', testQuery, ['noah']);

test('email:/[^.:@\\s](?:[^:@\\s]*[^.:@\\s])?@[^.@\\s]+(?:\\.[^.@\\s]+)*/', testQuery, ['noah']);

test('phoneNumber:"404-050-2611"', testQuery, ['noah']);
test.skip('phoneNumber:404', testQuery, ['noah']);

test.skip('balance:364', testQuery, ['noah']);

test('(David)', testQuery, ['david']);
test('(name:david OR name:john)', testQuery, ['david', 'john']);
test('(name:"foo bar" AND nick:"quick fox") OR name:fox', testQuery, ['fox']);
test('(name:fox OR name:"foo bar" AND nick:"old dog")', testQuery, ['foo bar']);
test('(name:fox OR (name:"foo bar" AND nick:"old dog"))', testQuery, ['fox', 'foo bar']);
