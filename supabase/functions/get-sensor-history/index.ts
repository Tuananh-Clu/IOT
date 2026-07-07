const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Deno is provided by the Supabase Edge Functions runtime. Declare it for TS.
declare const Deno: any

const INFLUX_HOST = "https://us-east-1-1.aws.cloud2.influxdata.com"
const INFLUX_TOKEN = Deno.env.get("INFLUX_TOKEN")
const INFLUX_DATABASE = "sensor_parking"

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { hours = 1 } = await req.json().catch(() => ({}))
    const q = `SELECT * FROM parking_sensor WHERE time > now() - ${hours}h`

    const url = `${INFLUX_HOST}/query?db=${encodeURIComponent(INFLUX_DATABASE)}&q=${encodeURIComponent(q)}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token ${INFLUX_TOKEN}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Influx query failed (${response.status}): ${text}`)
    }

    const raw = await response.json()
    const series = raw?.results?.[0]?.series?.[0]
    const rows = series
      ? series.values.map((vals: any[]) => {
          const row: Record<string, any> = {}
          series.columns.forEach((col: string, i: number) => (row[col] = vals[i]))
          return row
        })
      : []

    return new Response(JSON.stringify(rows), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})