const ProgressBar = ({ currentStatus }) => {
  const steps = ["Requested", "Accepted", "Completed"];

  const getStepIndex = () => {
    switch (currentStatus) {
      case "requested":
        return 0;
      case "accepted":
        return 1;
      case "completed":
        return 2;
      default:
        return -1;
    }
  };

  const currentStep = getStepIndex();

  return (
    <div className="flex justify-center py-10">
      <div className="w-2/3 md:w-1/2 lg:w-1/3">
        <div className="flex justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step} className="text-center">
              <div
                className={`text-xs mt-2 transition-all duration-300 ${
                  index <= currentStep ? "font-semibold" : "text-gray-500"
                }`}
              >
                {step}
              </div>
            </div>
          ))}
        </div>

        <div className="h-2 w-full bg-gray-300 rounded-full relative">
          <div
            className={`h-full rounded-full`}
            style={{
              width: `${(currentStep + 1) * (100 / steps.length)}%`,
              backgroundColor:
                currentStep === 0
                  ? "red"
                  : currentStep === 1
                  ? "blue"
                  : "green",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
