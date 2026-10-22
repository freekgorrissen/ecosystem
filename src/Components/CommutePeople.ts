export interface CommutePerson {
  id: string; // key in the API's people.json
  name: string;
}

const commutePeople: CommutePerson[] = [
  { id: "freek", name: "Freek" },
  { id: "domi", name: "Domi" },
];

export default commutePeople;
