function GlassOrbs() {
  const orbs = [
    {
      id: "orb-1",
      size: 420,
      x: "15%",
      y: "20%",
      color: "rgba(139, 92, 246, 0.07)",
      anim: "animate-orb-1",
      blur: 90,
    },
    {
      id: "orb-2",
      size: 340,
      x: "78%",
      y: "15%",
      color: "rgba(167, 139, 250, 0.05)",
      anim: "animate-orb-2",
      blur: 80,
    },
    {
      id: "orb-3",
      size: 280,
      x: "60%",
      y: "65%",
      color: "rgba(139, 92, 246, 0.06)",
      anim: "animate-orb-3",
      blur: 70,
    },
    {
      id: "orb-4",
      size: 220,
      x: "25%",
      y: "70%",
      color: "rgba(212, 212, 216, 0.04)",
      anim: "animate-orb-2",
      blur: 60,
    },
    {
      id: "orb-5",
      size: 180,
      x: "50%",
      y: "35%",
      color: "rgba(139, 92, 246, 0.04)",
      anim: "animate-orb-1",
      blur: 50,
    },
  ];

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`absolute rounded-full ${orb.anim}`}
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: orb.color,
            filter: `blur(${orb.blur}px)`,
            WebkitFilter: `blur(${orb.blur}px)`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}

export default GlassOrbs;
