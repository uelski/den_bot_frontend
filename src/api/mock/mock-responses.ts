interface MockResponse {
  keywords: string[]
  response: string
}

const MOCK_RESPONSES: MockResponse[] = [
  {
    keywords: ["population", "people", "residents", "how many"],
    response:
      "Denver's estimated population is approximately **715,522** as of the most recent census data. The Denver-Aurora-Lakewood metropolitan area has a population of about *2.96 million*, making it the 19th-largest metropolitan area in the United States. The city has experienced significant growth over the past decade, with a population increase of roughly 19.2% since 2010.",
  },
  {
    keywords: ["weather", "climate", "temperature", "snow", "sunny"],
    response:
      "Denver enjoys a **semi-arid climate** with over *300 days of sunshine* per year. Average temperatures range from 43°F (6°C) in winter to 88°F (31°C) in summer. The city receives about 57 inches of snow annually, though individual snowstorms rarely last more than a day or two. Denver's elevation of 5,280 feet (1,609 meters) contributes to its dry air and rapid temperature changes — it's not uncommon to see a 40°F swing in a single day.",
  },
  {
    keywords: ["neighborhood", "area", "district", "lodo", "rino", "capitol"],
    response:
      "Denver has **78 official neighborhoods**, each with its own character. Some highlights:\n\n- **LoDo (Lower Downtown)**: The historic heart of Denver with Victorian-era buildings, Coors Field, and Union Station\n- **RiNo (River North Art District)**: A vibrant arts and food scene with murals, breweries, and galleries\n- **Capitol Hill**: Denver's most densely populated neighborhood, known for nightlife, restaurants, and historic mansions\n- **Cherry Creek**: Upscale shopping and dining district\n- **Five Points**: Historically the center of Denver's African American community and jazz scene",
  },
  {
    keywords: ["park", "outdoor", "recreation", "mountain", "hiking"],
    response:
      "Denver offers incredible outdoor access. The city maintains over **200 parks** covering more than 6,000 acres. **City Park** is the largest at 330 acres, home to the Denver Zoo and Denver Museum of Nature & Science. The city is also a gateway to world-class mountain recreation — Rocky Mountain National Park is about 70 miles northwest, and there are *dozens of ski resorts* within a 2-hour drive. The city's extensive trail system includes the 40-mile Cherry Creek Trail and the Platte River Trail.",
  },
  {
    keywords: ["transit", "transport", "bus", "train", "rtd", "commute"],
    response:
      "Denver's public transit system is operated by **RTD (Regional Transportation District)**. The system includes:\n\n- **Light rail**: 8 lines covering 78 miles, connecting downtown to suburbs and Denver International Airport (the A Line)\n- **Bus network**: Over 100 routes across the metro area\n- **Free MallRide**: A free shuttle along the 16th Street Mall downtown\n\nDenver International Airport (DEN) is the 5th-busiest airport in the US, located about 25 miles northeast of downtown. The city is also increasingly *bike-friendly*, with over 195 miles of on-street bike facilities.",
  },
  {
    keywords: ["food", "restaurant", "eat", "dining", "brewery", "beer"],
    response:
      "Denver has a thriving food and beverage scene. The city is known as the **Napa Valley of Beer**, with over *70 breweries* within city limits. Notable dining highlights include the *Larimer Square* restaurant row, the diverse food halls in RiNo, and the famous green chile that tops everything from burritos to burgers. Denver's culinary scene has earned multiple James Beard Award nominations, and the city's farm-to-table movement benefits from Colorado's agricultural heritage.",
  },
  {
    keywords: ["economy", "jobs", "business", "industry", "tech"],
    response:
      "Denver has a diverse and growing economy. Key industries include **technology**, aerospace & defense, financial services, healthcare, and energy. The city has become a major *tech hub*, attracting companies and startups. Major employers include Lockheed Martin, Arrow Electronics, DaVita, and Western Union (all headquartered in the metro area). The unemployment rate typically runs below the national average, and the city's cost of living, while rising, remains lower than coastal tech hubs like San Francisco or New York.",
  },
  {
    keywords: ["history", "founded", "gold", "old", "historic"],
    response:
      "Denver was founded in **November 1858** during the Pike's Peak Gold Rush. The city was named after James W. Denver, the governor of the Kansas Territory at the time. Key historical milestones include:\n\n- *1870*: The Denver Pacific Railway connected the city to the transcontinental railroad\n- *1876*: Colorado achieved statehood, with Denver as the capital\n- *1881*: The Tabor Grand Opera House opened, signaling Denver's cultural ambitions\n- *1995*: Denver International Airport opened, replacing the old Stapleton Airport\n\nDenver's nickname, the **Mile High City**, comes from its elevation of exactly 5,280 feet above sea level.",
  },
]

const DEFAULT_RESPONSE =
  "Denver, the **Mile High City**, is the capital of Colorado with a population of over 715,000. Known for its stunning mountain views, vibrant cultural scene, and 300+ days of sunshine, Denver offers an exceptional quality of life. The city is a growing tech hub with strong industries in aerospace, healthcare, and energy. Whether you're interested in outdoor recreation, craft breweries, professional sports, or arts and culture, Denver has something for everyone. Feel free to ask me about specific topics like *neighborhoods*, *transit*, *parks*, *food*, or *history*!"

export function getMockResponse(query: string): string {
  const lower = query.toLowerCase()
  const match = MOCK_RESPONSES.find((r) =>
    r.keywords.some((kw) => lower.includes(kw))
  )
  return match?.response ?? DEFAULT_RESPONSE
}
