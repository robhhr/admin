export const isServerInMaintenance = () => {
  const isMaintenance = Boolean(process.env.MAINTENANCE_MODE === 'true')

  return {isMaintenance}
}
