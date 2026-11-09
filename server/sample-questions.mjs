// Original practice material. These are NOT official previous-year questions.
const rows=[
['JEE','Mathematics','Easy','Quadratics','The sum of the roots of x² − 5x + 6 = 0 is:',['2','3','5','6'],2,'For ax² + bx + c = 0, the sum of the roots is −b/a = 5.'],
['JEE','Mathematics','Medium','Calculus','The derivative of x² sin x is:',['2x cos x','2x sin x + x² cos x','x² cos x','2x sin x'],1,'Apply the product rule: (x²)′ sin x + x²(sin x)′.'],
['JEE','Mathematics','Hard','Integration','The value of ∫₀¹ x/(1+x²) dx is:',['ln 2','1/2','(ln 2)/2','1'],2,'Set u = 1+x²; du = 2x dx. The integral equals [ln(1+x²)/2]₀¹.'],
['JEE','Physics','Easy','Kinematics','An object starts from rest with constant acceleration 2 m/s². Its speed after 3 s is:',['3 m/s','6 m/s','9 m/s','12 m/s'],1,'v = u + at = 0 + 2×3 = 6 m/s.'],
['JEE','Physics','Medium','Electricity','Two resistors of 6 Ω each are connected in parallel. Their equivalent resistance is:',['12 Ω','6 Ω','3 Ω','1 Ω'],2,'1/R = 1/6 + 1/6 = 1/3, so R = 3 Ω.'],
['JEE','Physics','Hard','Circular motion','For a particle moving in a vertical circle of radius r, the minimum speed at the top to keep a light string taut is:',['√(gr)','√(2gr)','√(3gr)','√(5gr)'],0,'At the limiting top point, tension is zero: mg = mv²/r, so v = √(gr).'],
['JEE','Chemistry','Easy','Mole concept','The number of moles in 18 g of pure water (molar mass 18 g/mol) is:',['0.5','1','2','18'],1,'n = mass/molar mass = 18/18 = 1 mol.'],
['JEE','Chemistry','Medium','Equilibrium','For a reaction with equilibrium constant K = 1, the standard Gibbs energy change at that temperature is:',['Positive','Negative','Zero','Cannot be related to K'],2,'ΔG° = −RT ln K. Since ln 1 = 0, ΔG° = 0.'],
['JEE','Chemistry','Hard','Kinetics','A first-order reaction has half-life t. The fraction of reactant remaining after 3t is:',['1/3','1/6','1/8','1/9'],2,'Each half-life halves the remaining amount; (1/2)³ = 1/8.'],
['NEET','Physics','Easy','Units','The SI unit of force is:',['Joule','Watt','Newton','Pascal'],2,'Force = mass × acceleration, measured in kg m s⁻², called the newton.'],
['NEET','Physics','Medium','Optics','A convex lens of focal length 20 cm has power:',['+5 D','−5 D','+0.05 D','+20 D'],0,'P = 1/f with f in metres. 1/0.20 = +5 dioptres.'],
['NEET','Physics','Hard','Modern physics','If the accelerating voltage of an electron is multiplied by 4 in the nonrelativistic regime, its de Broglie wavelength becomes:',['Twice','Half','Four times','Unchanged'],1,'λ = h/√(2meV), hence λ is proportional to 1/√V.'],
['NEET','Chemistry','Easy','Atomic structure','The atomic number of an element equals the number of:',['Neutrons','Protons','Protons plus neutrons','Electron shells'],1,'Atomic number Z is defined as the proton count in the nucleus.'],
['NEET','Chemistry','Medium','Acids and bases','The pH of 10⁻³ M HCl, assuming complete dissociation, is approximately:',['1','2','3','11'],2,'[H⁺] ≈ 10⁻³ M; pH = −log₁₀[H⁺] = 3.'],
['NEET','Chemistry','Hard','Electrochemistry','The charge carried by one mole of electrons is approximately:',['6.022×10²³ C','1.602×10⁻¹⁹ C','96500 C','8.314 C'],2,'The Faraday constant is N_A × elementary charge, approximately 96485 C mol⁻¹.'],
['NEET','Botany','Easy','Cell biology','The main site of photosynthesis in a plant cell is the:',['Mitochondrion','Chloroplast','Ribosome','Nucleus'],1,'Chloroplasts contain the photosynthetic pigments and machinery.'],
['NEET','Botany','Medium','Photosynthesis','The first stable product of CO₂ fixation in a C₃ plant is:',['Oxaloacetate','Pyruvate','3-phosphoglycerate','Glucose'],2,'Rubisco fixes CO₂ to RuBP; the unstable six-carbon product splits into two 3-PGA molecules.'],
['NEET','Botany','Hard','Genetics','In an Aa × Aa cross with complete dominance, the expected recessive phenotype fraction is:',['1/2','1/4','3/4','1'],1,'Genotypes occur in the ratio AA:Aa:aa = 1:2:1. Only aa has the recessive phenotype.'],
['NEET','Zoology','Easy','Human physiology','Which cells primarily transport oxygen in human blood?',['Platelets','Red blood cells','Neurons','Lymphocytes'],1,'Red blood cells contain haemoglobin, which binds and transports oxygen.'],
['NEET','Zoology','Medium','Human physiology','The normal pacemaker of the human heart is the:',['AV node','SA node','Bundle of His','Purkinje fibres'],1,'The sinoatrial node normally initiates the impulse that sets the heart rhythm.'],
['NEET','Zoology','Hard','Molecular biology','During translation, an anticodon is found on:',['mRNA','DNA','tRNA','Amino acid'],2,'A tRNA anticodon base-pairs with the complementary mRNA codon.'],
['Foundation','Mathematics','Easy','Algebra','If 3x + 2 = 14, x equals:',['2','3','4','6'],2,'Subtract 2 to get 3x=12, then divide by 3.'],
['Foundation','Physics','Easy','Motion','Speed equals:',['Distance × time','Distance / time','Time / distance','Mass / volume'],1,'Average speed is total distance divided by total elapsed time.'],
['Foundation','Chemistry','Easy','Matter','Which is a chemical change?',['Melting ice','Boiling water','Rusting iron','Cutting paper'],2,'Rusting forms new substances (iron oxides); the other options are physical changes.']
];
export const sampleQuestions=rows.map(([exam,subject,level,topic,text,options,correct,explanation])=>({exam,subject,level,topic,text,options,correct,explanation,source:'R-IIT original practice — not a past-year paper',year:'',paper:'Starter practice',published:true}));
