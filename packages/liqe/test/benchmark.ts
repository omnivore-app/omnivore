import {
  add,
  complete,
  cycle,
  suite,
} from 'benny';
import faker from 'faker';
import {
  parse,
  filter,
} from '../src/Liqe';

const randomInRange = (min: number, max: number) => {
  return Math.floor(
    Math.random() * (Math.ceil(max) - Math.floor(min) + 1) + min,
  );
};

type Person = {
  email: string,
  foo: {
    bar: {
      baz: string,
    },
  },
  height: number,
  name: string,
};

const persons: Person[] = [];

let size = 10_000;

while (size--) {
  persons.push({
    email: faker.internet.email(),
    foo: {
      bar: {
        baz: faker.name.findName(),
      },
    },
    height: randomInRange(160, 220),
    name: faker.name.findName(),
  });
}

void suite(
  'liqe',

  add('filters list by the "name" field using simple strict equality check', () => {
    const query = parse('name:"Gajus"');

    return () => {
      filter(query, persons);
    };
  }),

  add('filters list by the "name" field using regex check', () => {
    const query = parse('name:/Gajus/ui');

    return () => {
      filter(query, persons);
    };
  }),

  add('filters list by the "name" field using loose inclusion check', () => {
    const query = parse('name:Gajus');

    return () => {
      filter(query, persons);
    };
  }),

  add('filters list by the "name" field using star (*) wildcard check', () => {
    const query = parse('name:Ga*');

    return () => {
      filter(query, persons);
    };
  }),

  add('filters list by the "name" field using question mark (?) wildcard check', () => {
    const query = parse('name:Gaju?');

    return () => {
      filter(query, persons);
    };
  }),

  add('filters list by any field using loose inclusion check', () => {
    const query = parse('Gajus');

    return () => {
      filter(query, persons);
    };
  }),

  add('filters list by the "height" field using strict equality check', () => {
    const query = parse('height:180');

    return () => {
      filter(query, persons);
    };
  }),

  add('filters list by the "height" field using range check', () => {
    const query = parse('height:[160 TO 180]');

    return () => {
      filter(query, persons);
    };
  }),

  add('filters list by the "foo.bar.baz" field using simple strict equality check', () => {
    const query = parse('foo.bar.baz:"Gajus"');

    return () => {
      filter(query, persons);
    };
  }),

  cycle(),
  complete(),
);

